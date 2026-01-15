import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { DishesService } from '../dishes/dishes.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private dishesService: DishesService,
  ) {}

  private async getOrCreate(userId: string, populate = false) {
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    if (populate) {
      await cart.populate('items.dish');
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreate(userId, false);
    
    // Deduplicate items by dish ID (merge quantities)
    const itemMap = new Map<string, { dish: Types.ObjectId; quantity: number }>();
    
    cart.items.forEach((item: any) => {
      const dishId = item.dish instanceof Types.ObjectId 
        ? item.dish.toString() 
        : (item.dish?._id ? item.dish._id.toString() : item.dish?.toString());
      
      if (itemMap.has(dishId)) {
        // Merge with existing item
        const existing = itemMap.get(dishId)!;
        existing.quantity += item.quantity;
      } else {
        // Add new item
        const dishObjId = item.dish instanceof Types.ObjectId 
          ? item.dish 
          : new Types.ObjectId(dishId);
        itemMap.set(dishId, { dish: dishObjId, quantity: item.quantity });
      }
    });
    
    // Rebuild items array if deduplication occurred
    if (itemMap.size !== cart.items.length) {
      const originalCount = cart.items.length;
      const deduplicatedItems = Array.from(itemMap.values());

      // Validate we're not losing items (total quantity should be preserved)
      const originalTotalQty = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      const newTotalQty = deduplicatedItems.reduce((sum, item) => sum + item.quantity, 0);

      if (newTotalQty !== originalTotalQty) {
        this.logger.warn(`Cart deduplication quantity mismatch: original=${originalTotalQty}, new=${newTotalQty}`);
      }

      // Clear existing items and add deduplicated ones
      cart.items.splice(0, cart.items.length);
      deduplicatedItems.forEach(({ dish, quantity }) => {
        cart.items.push({ dish, quantity } as any);
      });
      await cart.save();
      this.logger.debug(`Deduplicated cart items: ${originalCount} -> ${itemMap.size}, total qty: ${newTotalQty}`);
    }
    
    await cart.populate('items.dish');
    return this.toResponse(cart);
  }

  async addItem(userId: string, dishId: string, quantity = 1, isHalfPortion = false) {
    this.logger.debug(`Adding item to cart - userId: ${userId}, dishId: ${dishId} (type: ${typeof dishId}), quantity: ${quantity}, isHalfPortion: ${isHalfPortion}`);
    
    // Normalize dishId - ensure it's a string and trim whitespace
    const normalizedDishId = String(dishId).trim();
    
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(normalizedDishId)) {
      this.logger.warn(`Invalid dish ID format: ${normalizedDishId} (original: ${dishId})`);
      throw new NotFoundException(`Invalid dish ID format. Expected MongoDB ObjectId, got: ${normalizedDishId}`);
    }
    
    const dish = await this.dishesService.findOne(normalizedDishId);
    if (!dish) {
      this.logger.warn(`Dish not found with ID: ${normalizedDishId}`);
      throw new NotFoundException(`Dish not found with ID: ${normalizedDishId}`);
    }
    
    if (!dish.inStock) {
      throw new NotFoundException('Dish out of stock');
    }
    
    if (isHalfPortion && !dish.hasHalfPortion) {
      throw new NotFoundException('Half portion not available for this dish');
    }
    
    // Get cart without populating to ensure consistent comparison
    const cart = await this.getOrCreate(userId, false);
    const dishObjectId = new Types.ObjectId(normalizedDishId);
    
    // Find existing item by comparing dish IDs and portion type
    const existing = cart.items.find((i: any) => {
      const itemDishId = i.dish instanceof Types.ObjectId 
        ? i.dish.toString() 
        : (i.dish?._id ? i.dish._id.toString() : i.dish?.toString());
      return itemDishId === dishObjectId.toString() && i.isHalfPortion === isHalfPortion;
    });
    
    if (existing) {
      existing.quantity += quantity;
      this.logger.debug(`Updated existing cart item quantity to ${existing.quantity}`);
    } else {
      cart.items.push({ dish: dishObjectId, quantity, isHalfPortion });
      this.logger.debug(`Added new item to cart with quantity ${quantity}, isHalfPortion: ${isHalfPortion}`);
    }
    await cart.save();
    await cart.populate('items.dish');
    return this.toResponse(cart);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreate(userId, false);
    const item = (cart.items as any).id ? (cart.items as any).id(itemId) : cart.items.find((i: any) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundException('Item not found');
    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.dish');
    return this.toResponse(cart);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreate(userId, false);
    const item = (cart.items as any).id ? (cart.items as any).id(itemId) : cart.items.find((i: any) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundException('Item not found');
    item.deleteOne();
    await cart.save();
    await cart.populate('items.dish');
    return this.toResponse(cart);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreate(userId);
    cart.items = [];
    await cart.save();
    return { cleared: true };
  }

  toResponse(cart: CartDocument) {
    const items = cart.items.map((i: any) => {
      const dish = i.dish;
      const quantity = i.quantity;
      const isHalfPortion = i.isHalfPortion || false;
      const price = isHalfPortion && dish?.halfPortionPrice ? dish.halfPortionPrice : (dish?.price || 0);
      
      // Handle Buy 1 Get 1 Free pricing
      let itemTotal = 0;
      if (dish?.isBuyOneGetOne && quantity > 0) {
        // For BOGO: charge for half the quantity (rounded up)
        // e.g., quantity 2 = charge for 1, quantity 3 = charge for 2, quantity 4 = charge for 2
        const chargeableQuantity = Math.ceil(quantity / 2);
        itemTotal = price * chargeableQuantity;
      } else {
        itemTotal = price * quantity;
      }
      
      return {
        id: i._id,
        dish: dish,
        quantity: quantity,
        isHalfPortion: isHalfPortion,
        price: price,
        itemTotal: itemTotal,
      };
    });
    const total = items.reduce((sum, i) => sum + (i.itemTotal || i.price * i.quantity), 0);
    return { id: cart.id, cartItems: items, totalPrice: total };
  }
}



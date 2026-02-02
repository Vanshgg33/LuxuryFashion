import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Dish, DishDocument } from '../dishes/schemas/dish.schema';

// Free item type for validation response
export interface FreeItemResult {
  dish: {
    _id: Types.ObjectId;
    name: string;
    price: number;
    imageUrl: string | undefined;
  };
  quantity: number;
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
  ) {}

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.couponModel.findOne({ code });
    if (existing) throw new BadRequestException('Coupon code already exists');

    const coupon = await this.couponModel.create({
      ...dto,
      code,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });
    return coupon;
  }

  async findAll() {
    return this.couponModel
      .find()
      .populate('freeItems.dish', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveCoupons() {
    const now = new Date();
    const query: {
      isActive: boolean;
      $and?: Array<{
        $or: Array<Record<string, unknown>>;
      }>;
    } = {
      isActive: true,
    };

    // Valid from: either doesn't exist or is in the past
    query.$and = [
      {
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: null },
          { validFrom: { $lte: now } },
        ],
      },
      {
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: null },
          { validUntil: { $gte: now } },
        ],
      },
    ];

    // Usage limit: either doesn't exist, is 0 (unlimited), or not reached
    const coupons = await this.couponModel
      .find(query)
      .select('code discountType discountValue minOrderAmount maxDiscountAmount description validFrom validUntil usageLimit usedCount freeItems')
      .populate('freeItems.dish', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .exec();

    // Filter by usage limit in memory (MongoDB $expr can be slow)
    return coupons.filter((coupon) => {
      if (!coupon.usageLimit || coupon.usageLimit === 0) return true;
      return coupon.usedCount < coupon.usageLimit;
    });
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async findByCode(code: string) {
    return this.couponModel.findOne({ code: code.toUpperCase().trim() });
  }

  async validate(dto: ValidateCouponDto) {
    // Normalize coupon code to uppercase
    const normalizedCode = dto.code.toUpperCase().trim();
    this.logger.debug(`Validating coupon: ${normalizedCode} for subtotal: ${dto.subtotal}`);
    
    const coupon = await this.findByCode(normalizedCode);
    if (!coupon) {
      this.logger.warn(`Coupon not found: ${normalizedCode}`);
      throw new BadRequestException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      this.logger.warn(`Coupon is not active: ${normalizedCode}`);
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      this.logger.warn(`Coupon not yet valid: ${normalizedCode}`);
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      this.logger.warn(`Coupon expired: ${normalizedCode}`);
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      this.logger.warn(`Coupon usage limit reached: ${normalizedCode} (${coupon.usedCount}/${coupon.usageLimit})`);
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrderAmount && dto.subtotal < coupon.minOrderAmount) {
      this.logger.warn(`Minimum order amount not met: ${normalizedCode} (subtotal: ${dto.subtotal}, required: ${coupon.minOrderAmount})`);
      throw new BadRequestException(`Minimum order amount is ₹${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (dto.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, dto.subtotal);

    const finalDiscount = Math.round(discount * 100) / 100;
    const finalAmount = dto.subtotal - finalDiscount;

    this.logger.log(`Coupon validated successfully: ${normalizedCode} - Discount: ₹${finalDiscount}, Final: ₹${finalAmount}`);

    // Get free items with dish details and validate stock
    let freeItems: FreeItemResult[] = [];
    if (coupon.freeItems && coupon.freeItems.length > 0) {
      const dishIds = coupon.freeItems.map((item) => item.dish);
      const dishes = await this.dishModel
        .find({ _id: { $in: dishIds } })
        .select('_id name price imageUrl inStock')
        .exec();

      const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

      // Check if any free item is out of stock
      const outOfStockItems: string[] = [];

      freeItems = coupon.freeItems
        .map((item) => {
          const dish = dishMap.get(item.dish.toString());
          if (!dish) return null;

          // Track out of stock items but still include them (they'll be filtered)
          if (dish.inStock === false) {
            outOfStockItems.push(dish.name);
            return null; // Don't include out of stock items
          }

          return {
            dish: {
              _id: dish._id,
              name: dish.name,
              price: dish.price,
              imageUrl: dish.imageUrl,
            },
            quantity: item.quantity,
          };
        })
        .filter((item): item is FreeItemResult => item !== null);

      // Log warning if some free items are unavailable
      if (outOfStockItems.length > 0) {
        this.logger.warn(`Some free items are out of stock for coupon ${normalizedCode}: ${outOfStockItems.join(', ')}`);
      }
    }

    return {
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: finalDiscount,
      discountFormatted: `₹${finalDiscount}`,
      finalAmount: finalAmount,
      finalAmountFormatted: `₹${finalAmount}`,
      freeItems,
      message: 'Coupon applied successfully',
    };
  }

  async applyCoupon(code: string) {
    // Normalize coupon code to uppercase
    const normalizedCode = code.toUpperCase().trim();
    this.logger.debug(`Applying coupon: ${normalizedCode}`);
    
    const coupon = await this.findByCode(normalizedCode);
    if (!coupon) throw new NotFoundException('Coupon not found');
    
    coupon.usedCount += 1;
    await coupon.save();
    this.logger.log(`Coupon applied: ${normalizedCode} - Usage count: ${coupon.usedCount}`);
    return coupon;
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    const coupon = await this.couponModel.findByIdAndUpdate(id, dto, { new: true });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async delete(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }
}






import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish: Types.ObjectId;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: false })
  isHalfPortion: boolean;

  @Prop({ default: false })
  isFreeItem: boolean;

  @Prop()
  couponCode?: string;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop()
  appliedCoupon?: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);



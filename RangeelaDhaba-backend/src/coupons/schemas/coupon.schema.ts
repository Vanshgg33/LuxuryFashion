import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ _id: false })
export class FreeItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish: Types.ObjectId;

  @Prop({ default: 1 })
  quantity: number;
}

export const FreeItemSchema = SchemaFactory.createForClass(FreeItem);

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: 0 })
  minOrderAmount?: number;

  @Prop()
  maxDiscountAmount?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  validFrom?: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ default: 0 })
  usageLimit?: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: [FreeItemSchema], default: [] })
  freeItems: FreeItem[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);







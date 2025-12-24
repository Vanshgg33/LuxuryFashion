import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

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
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);







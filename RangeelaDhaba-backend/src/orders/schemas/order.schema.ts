import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: false })
  isFree?: boolean;

  @Prop({ default: false })
  isHalfPortion?: boolean;

  @Prop({ default: false })
  isBuyOneGetOne?: boolean;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  discountAmount?: number;

  @Prop()
  couponCode?: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ enum: ['delivery', 'takeaway'], default: 'delivery' })
  orderType: 'delivery' | 'takeaway';

  @Prop({ type: Object })
  address: Record<string, any>;

  @Prop({ default: 'placed', enum: ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'] })
  status: string;

  @Prop()
  paymentId?: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] })
  paymentStatus?: string;

  @Prop()
  specialInstructions?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);



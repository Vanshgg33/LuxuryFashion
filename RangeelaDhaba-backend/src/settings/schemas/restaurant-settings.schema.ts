import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantSettingsDocument = RestaurantSettings & Document;

@Schema({ timestamps: true })
export class RestaurantSettings {
  @Prop({ required: true, default: 0 })
  lat: number;

  @Prop({ required: true, default: 0 })
  lng: number;

  @Prop()
  address?: string;

  @Prop({ default: 'rangeela8981@gmail.com' })
  supportEmail?: string;

  @Prop({ default: '+91 89812 60291' })
  supportPhone?: string;

  @Prop({ default: true })
  isDeliveryEnabled: boolean;

  @Prop({ default: 40 })
  deliveryFee: number;

  @Prop({ default: '09:00' })
  openingTime: string;

  @Prop({ default: '22:00' })
  closingTime: string;

  @Prop({ default: true })
  isOpen: boolean;

  @Prop()
  closureReason?: string;

  @Prop({ type: Object, default: {} })
  categoryTimeRestrictions: Record<string, { availableFrom: string; availableTo: string; isEnabled: boolean }>;
}

export const RestaurantSettingsSchema = SchemaFactory.createForClass(RestaurantSettings);



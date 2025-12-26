import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  label: string; // Home, Work, etc.

  @Prop()
  houseNumber?: string; // House/Building number

  @Prop()
  apartment?: string; // Apartment/Flat number

  @Prop()
  floor?: string; // Floor number

  @Prop({ required: true })
  street: string;

  @Prop()
  area?: string; // Area/Locality

  @Prop()
  landmark?: string; // Nearby landmark

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true, default: 'India' })
  country: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  lat?: number;

  @Prop()
  lng?: number;

  @Prop({ default: false })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);







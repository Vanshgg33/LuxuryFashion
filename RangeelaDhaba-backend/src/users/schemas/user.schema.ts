import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  googleId?: string;

  @Prop({ type: Object })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phoneNumber?: string;
    lat?: number;
    lng?: number;
  };

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);



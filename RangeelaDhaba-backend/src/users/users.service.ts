import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  create(data: Partial<User>) {
    return new this.userModel(data).save();
  }

  update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  listUsers() {
    return this.userModel.find().select('-password -otpCode -otpExpires').exec();
  }

  updateRole(id: string, role: 'user' | 'admin') {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password -otpCode -otpExpires');
  }

  updateAddress(id: string, address: Record<string, unknown>) {
    return this.userModel.findByIdAndUpdate(id, { address }, { new: true }).exec();
  }

  findAllAdmins() {
    return this.userModel.find({ role: 'admin' }).select('_id').exec();
  }
}



import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) {}

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { isDefault: false });
    }
    return this.addressModel.create({ ...dto, user: userId, country: dto.country || 'India' });
  }

  async findAll(userId: string) {
    return this.addressModel.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressModel.findOne({ _id: id, user: userId });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, userId: string, dto: Partial<CreateAddressDto>) {
    if (dto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { isDefault: false });
    }
    const address = await this.addressModel.findOneAndUpdate(
      { _id: id, user: userId },
      dto,
      { new: true },
    );
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async delete(id: string, userId: string) {
    const address = await this.addressModel.findOneAndDelete({ _id: id, user: userId });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async setDefault(id: string, userId: string) {
    await this.addressModel.updateMany({ user: userId }, { isDefault: false });
    const address = await this.addressModel.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true },
      { new: true },
    );
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }
}







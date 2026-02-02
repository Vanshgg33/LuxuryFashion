import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUserPayload) {
    return this.addressesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.addressesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtUserPayload, @Param('id') id: string, @Body() dto: Partial<CreateAddressDto>) {
    return this.addressesService.update(id, user.userId, dto);
  }

  @Patch(':id/default')
  setDefault(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.addressesService.setDefault(id, user.userId);
  }

  @Delete(':id')
  delete(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.addressesService.delete(id, user.userId);
  }
}







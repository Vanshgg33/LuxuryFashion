import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.listUsers();
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: 'user' | 'admin') {
    return this.usersService.updateRole(id, role);
  }
}


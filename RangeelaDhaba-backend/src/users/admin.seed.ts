import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeed.name);
  constructor(private usersService: UsersService) {}

  async onApplicationBootstrap() {
    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    const name = process.env.DEFAULT_ADMIN_NAME || 'Admin';
    if (!email || !password) return;
    const existing = await this.usersService.findByEmail(email);
    if (existing) return;
    const hashed = await bcrypt.hash(password, 10);
    await this.usersService.create({ email, password: hashed, name, role: 'admin' });
    this.logger.log(`Seeded default admin ${email}`);
  }
}


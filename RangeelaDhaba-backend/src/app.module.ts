import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DishesModule } from './dishes/dishes.module';
import { BannersModule } from './banners/banners.module';
import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MailerModule } from './mailer/mailer.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CouponsModule } from './coupons/coupons.module';
import { AddressesModule } from './addresses/addresses.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 
      'mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@rangeeladhaba.l20qyzs.mongodb.net/rangeeladhaba?retryWrites=true&w=majority&appName=RangeelaDhaba',
      {
        retryWrites: true,
        w: 'majority',
      }
    ),
    CloudinaryModule,
    MailerModule,
    AuthModule,
    UsersModule,
    DishesModule,
    BannersModule,
    SettingsModule,
    CartModule,
    OrdersModule,
    AnalyticsModule,
    CouponsModule,
    AddressesModule,
    FavoritesModule,
    ReviewsModule,
    PaymentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}



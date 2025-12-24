import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Increase body size limit for file uploads (50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // Skip validation when no DTO/metatype is provided (like with @Req())
      skipMissingProperties: false,
      // Only validate when there's a metatype (DTO class)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.APP_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`RangeelaDhaba API running on port ${port}`);
}
bootstrap();



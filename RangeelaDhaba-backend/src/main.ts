import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

async function createNestServer(expressInstance: express.Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // Increase body size limit for file uploads (50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://localhost:5173',
      ...(process.env.APP_URL?.split(',') || []),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.init();
  return app;
}

// For Vercel serverless
let cachedServer: any;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    await createNestServer(expressApp);
    cachedServer = expressApp;
  }
  return cachedServer(req, res);
}

// For local development
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://localhost:5173',
      ...(process.env.APP_URL?.split(',') || []),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`RangeelaDhaba API running on port ${port}`);
}

// Only run bootstrap in non-serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap();
}



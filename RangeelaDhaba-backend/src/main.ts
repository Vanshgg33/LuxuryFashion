import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173',
  'https://luxury-fashion-sjmv.vercel.app',
  'https://luxury-fashion-sjmv-git-main-vanshs-projects-3fb5c63f.vercel.app',
  'https://luxury-fashion-sjmv-hxszm4b90-vanshs-projects-3fb5c63f.vercel.app',
  ...(process.env.APP_URL?.split(',') || []),
].filter(Boolean);

// Manual CORS middleware for serverless
function corsMiddleware(req: any, res: any, next: any) {
  const origin = req.headers.origin;

  // Check if origin is in allowedOrigins list
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request immediately
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  next();
}

// Apply CORS middleware to express app
expressApp.use(corsMiddleware);

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

  await app.init();
  return app;
}

// For Vercel serverless
let cachedServer: any;

export default async function handler(req: any, res: any) {
  // Handle CORS preflight immediately
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.statusCode = 204;
    return res.end();
  }

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
      'https://luxury-fashion-sjmv.vercel.app',
      'https://luxury-fashion-sjmv-git-main-vanshs-projects-3fb5c63f.vercel.app',
      'https://luxury-fashion-sjmv-hxszm4b90-vanshs-projects-3fb5c63f.vercel.app',
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



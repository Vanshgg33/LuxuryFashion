import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173',
  // Frontend: luxury-fashion-sjmv
  'https://luxury-fashion-sjmv.vercel.app',
  'https://luxury-fashion-sjmv-git-main-vanshs-projects-3fb5c63f.vercel.app',
  'https://luxury-fashion-sjmv-hxszm4b90-vanshs-projects-3fb5c63f.vercel.app',
  'https://luxury-fashion-sjmv-rizein2mm-vanshs-projects-3fb5c63f.vercel.app',
  // Frontend: luxury-fashion-roqh
  'https://luxury-fashion-roqh.vercel.app',
  'https://luxury-fashion-roqh-git-main-vanshs-projects-3fb5c63f.vercel.app',
  'https://luxury-fashion-roqh-a7gdadm17-vanshs-projects-3fb5c63f.vercel.app',
  ...(process.env.APP_URL?.split(',') || []),
].filter(Boolean);

// Function to check if origin is allowed (including Vercel preview URLs)
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  
  // Check exact match
  if (allowedOrigins.includes(origin)) return true;
  
  // Check if it's a Vercel preview URL for luxury-fashion projects
  if ((origin.includes('luxury-fashion-sjmv') || origin.includes('luxury-fashion-roqh')) && origin.includes('.vercel.app')) {
    return true;
  }
  
  return false;
}

let cachedApp: any;

async function createNestServer() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Increase body size limit for file uploads (4.5MB max for Vercel serverless)
  // Note: Vercel has a hard limit of 4.5MB for serverless functions
  expressApp.use(json({ limit: '4.5mb' }));
  expressApp.use(urlencoded({ limit: '4.5mb', extended: true }));
  
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
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  // Handle CORS
  const origin = req.headers.origin;
  
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (origin) {
    // Allow the origin but without credentials for unknown origins
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  } else {
    // No origin header (same-origin request)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const server = await createNestServer();
  server(req, res);
}

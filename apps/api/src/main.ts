import 'dotenv/config';
console.log('DATABASE_URL set:', !!process.env['DATABASE_URL']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all our domains
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://spaas.vercel.app',
      'https://spaas.quickie-studio.com',
      'https://api.spaas.quickie-studio.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Remove global /api prefix
  app.setGlobalPrefix('');

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`🚀 SPAAS API is running on: http://localhost:${port}`);
}

bootstrap();
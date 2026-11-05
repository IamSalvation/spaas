import 'dotenv/config';
console.log('DATABASE_URL set:', !!process.env['DATABASE_URL']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so your frontend can talk to it later
  app.enableCors();

  // Remove the global /api prefix so routes are clean
  app.setGlobalPrefix('');

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`🚀 SPAAS API is running on: http://localhost:${port}`);
}

bootstrap();
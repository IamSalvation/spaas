import 'dotenv/config';
console.log('DATABASE_URL set:', !!process.env['DATABASE_URL']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS and restrict it to your live frontend and local development
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://spaas.vercel.app' // <-- Your live Vercel URL
    ],
    credentials: true,
  });

  // Remove the global /api prefix so routes are clean
  app.setGlobalPrefix('');

  // Render provides a PORT environment variable
  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`🚀 SPAAS API is running on: http://localhost:${port}`);
}

bootstrap();
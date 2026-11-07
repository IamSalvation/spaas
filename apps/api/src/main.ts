import 'dotenv/config';
console.log('DATABASE_URL set:', !!process.env['DATABASE_URL']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so your frontend (Vercel and localhost) can talk to it
  app.enableCors({
    origin: true, // Allows all origins. We can restrict this to specific domains later.
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
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable versioning in the API
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  app.use(cookieParser())

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200','https://chatfusionx.vercel.app','https://chatfusionx.web.app'],
    methods: 'GET, POST, PUT, DELETE',
    // allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable versioning in the API
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: 'GET, POST, PUT, DELETE',
    // allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

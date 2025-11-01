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

 app.use(cookieParser());

  //CRITICAL: Add explicit OPTIONS handling for Vercel BEFORE CORS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      
      const origin = req.headers.origin;

      const allowedOrigins = [
        'http://localhost:4200',
        'https://chatfusionx.vercel.app',
        'https://chatfusionx.web.app'
      ];

      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-CSRF-Token');
        res.status(200).end();
        return;
      } else {
        //Handle non-allowed origins
        res.status(403).json({ error: 'CORS: Origin not allowed' });
        return;
      }
    }
    next();
  });

  // Updated CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://chatfusionx.vercel.app',
      'https://chatfusionx.web.app'
    ],

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version',
      'X-CSRF-Token'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

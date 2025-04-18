import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RemoveHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.removeHeader('X-Render-Origin-Server');
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.removeHeader('X-Ratelimit-Limit-Long');
    res.removeHeader('X-Ratelimit-Limit-Medium');
    res.removeHeader('X-Ratelimit-Limit-Short');
    res.removeHeader('X-Ratelimit-Remaining-Long');
    res.removeHeader('X-Ratelimit-Remaining-Medium');
    res.removeHeader('X-Ratelimit-Remaining-Short');
    res.removeHeader('X-Ratelimit-Reset-Long');
    res.removeHeader('X-Ratelimit-Reset-Medium');
    res.removeHeader('X-Ratelimit-Reset-Short');

  // Remove Security Headers
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('Referrer-Policy');
  res.removeHeader('Permissions-Policy');

  // Set Custom Security Headers
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');

    next();
  }
}

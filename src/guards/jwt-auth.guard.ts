import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cls: ClsService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing.');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = decoded;

      this.cls.set('user', {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        roles: decoded.roles,
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}

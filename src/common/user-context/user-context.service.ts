import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserContextService {
  constructor(private readonly cls: ClsService) {}

  getUser() {
    return this.cls.get('user');
  }

  getUserId() {
    return this.cls.get('user')?.id;
  }

  getUserName() {
    return this.cls.get('user')?.name;
  }

  getUserEmail() {
    return this.cls.get('user')?.email;
  }
}

import { RolesBuilder } from 'nest-access-control';

export enum AppRole {
  USER = 'user',
  ADMIN = 'admin',
}

export const roles = new RolesBuilder();

// This is for user
roles
  .grant(AppRole.USER)

  // user APIs
  .readOwn('user')
  .updateOwn('user')
  .readAny('user')

  // request APIs
  .createOwn('request')
  .updateOwn('request')
  .deleteOwn('request')

  //message APIs
  .readOwn('message')

  //group APIs
  .createOwn('group')
  .updateOwn('group')
  .readOwn('group')

  //ai-chat APIs
  .readOwn('ai-chat')
  .createOwn('ai-chat');

// This is for admin
roles
  .grant(AppRole.ADMIN)
  .extend(AppRole.USER)

  // admin user APIs
  .readAny('user')
  .deleteAny('user')
  .create('user')
  .updateAny('user')
  .readAny('message')
  .readAny('ai-chat');

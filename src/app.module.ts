import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './connections/database/db-connection.module';
import { UserModule } from './modules/user/user.module';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './authentication/auth.module';
import { GroupModule } from './modules/group/group.module';
import { PrivateMessageModule } from './modules/private-message/private-message.module';
import { ChatFusionXAIModule } from './modules/chatfusionx-ai/chatfusionx-ai.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: 100,
        },
      ],
    }),
    DatabaseModule,
    SocketModule,
    UserModule,
    GroupModule,
    PrivateMessageModule,
    ChatFusionXAIModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,    {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },],
})
export class AppModule {
  constructor() {}
}

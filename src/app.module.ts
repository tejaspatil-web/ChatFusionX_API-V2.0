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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}

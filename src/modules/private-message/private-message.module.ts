import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivateMessageController } from './private-message.controller';
import { PrivateMessageService } from './private-message.service';
import { PrivateChat, PrivateChatSchema } from './private-message.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PrivateChat.name,
        schema: PrivateChatSchema,
        collection: 'private_chat_details',
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
  ],
  controllers: [PrivateMessageController],
  providers: [PrivateMessageService, JwtAuthGuard],
  exports: [PrivateMessageService],
})
export class PrivateMessageModule {
  constructor() {}
}

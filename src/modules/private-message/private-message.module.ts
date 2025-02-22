import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivateMessageController } from './private-message.controller';
import { PrivateMessageService } from './private-message.service';
import { PrivateChat, PrivateChatSchema } from './private-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrivateChat.name, schema: PrivateChatSchema, collection: 'private_chat_details' },
    ]),
  ],
  controllers: [PrivateMessageController],
  providers: [PrivateMessageService],
  exports: [PrivateMessageService],
})
export class PrivateMessageModule {
  constructor() {}
}

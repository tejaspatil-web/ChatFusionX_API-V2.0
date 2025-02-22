import { Module } from '@nestjs/common';
import { ChatFusionXAIService } from './chatfusionx-ai.service';
import { ChatFusionXAIController } from './chatfusionx-ai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatFusionXAI, ChatFusionXAISchema } from './chatfusionx-ai.schema';

@Module({
  imports:[
        MongooseModule.forFeature([
          { name: ChatFusionXAI.name, schema: ChatFusionXAISchema, collection: 'chat_fusionx_ai' },
        ]),
  ],
  controllers: [ChatFusionXAIController],
  providers: [ChatFusionXAIService],
  exports: [],
})
export class ChatFusionXAIModule {}

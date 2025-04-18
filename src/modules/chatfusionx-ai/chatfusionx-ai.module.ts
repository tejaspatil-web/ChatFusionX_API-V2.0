import { Module } from '@nestjs/common';
import { ChatFusionXAIService } from './chatfusionx-ai.service';
import { ChatFusionXAIController } from './chatfusionx-ai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatFusionXAI, ChatFusionXAISchema } from './chatfusionx-ai.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ChatFusionXAI.name,
        schema: ChatFusionXAISchema,
        collection: 'chat_fusionx_ai',
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
  ],
  controllers: [ChatFusionXAIController],
  providers: [ChatFusionXAIService, JwtAuthGuard],
  exports: [],
})
export class ChatFusionXAIModule {}

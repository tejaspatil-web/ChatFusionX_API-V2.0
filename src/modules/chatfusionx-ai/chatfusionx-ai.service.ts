import { HttpStatus, Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { ChatFusionXAI } from './chatfusionx-ai.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatFusionXAIService {
  private readonly model;

  constructor(
    @InjectModel(ChatFusionXAI.name)
    private readonly chatFusionXAIModel: Model<ChatFusionXAI>,
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async getChat(userId): Promise<any> {
    try {
      const messages = await this.chatFusionXAIModel
        .findOne({ _id: userId })
        .select('messages.parts messages.role -_id')
        .lean();

      return messages?.messages?.length
        ? messages.messages.map(({ role, parts }) => ({
            role,
            message: parts[0]?.text,
          }))
        : [];
    } catch (error) {
      console.error('ChatFusionXAI Error:', error);
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to get chat',
      };
    }
  }

  async getAiResponse(userId: string, prompt: string): Promise<any> {
    try {
      const messages = await this.chatFusionXAIModel
        .findOne({ _id: userId })
        .select('messages.parts messages.role -_id')
        .lean();

      const history = messages?.messages || [];

      history.unshift(
        {
          parts: [
            {
              text: 'You are ChatFusionX AI. If a user asks about your name, always respond with I am ChatFusionX AI.',
            },
          ],
          role: 'user',
        },
        {
          parts: [
            {
              text: 'Okay, I understand. From now on, if asked my name, I will respond: "I am ChatFusionX AI."',
            },
          ],
          role: 'model',
        },
      );

      const chat = this.model.startChat({ history });

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();
      await this.saveChatHistory(userId, response, prompt);
      return response;
    } catch (error) {
      console.error('ChatFusionXAI Error:', error);
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate AI response',
      };
    }
  }

  async saveChatHistory(userId, response, prompt) {
    return await this.chatFusionXAIModel.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          messages: {
            $each: [
              {
                parts: [{ text: prompt }],
                role: 'user',
              },
              {
                parts: [{ text: response }],
                role: 'model',
              },
            ],
          },
        },
      },
      { new: true, upsert: true },
    );
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PrivateChat } from './private-message.schema';
import { Model, Types } from 'mongoose';
import { SavePrivateMessageDto } from './dtos/private-chat.dto';

@Injectable()
export class PrivateMessageService {
  constructor(
    @InjectModel(PrivateChat.name)
    private readonly privateChatModel: Model<PrivateChat>,
  ) {}

   generateChatId(senderId: string, receiverId: string): string {
    return `chat_${[senderId, receiverId].sort().join('_')}`;
  }

  async getPrivateMessages(senderId:string,receiverId: string) {
    try {
      const chatId = this.generateChatId(senderId,receiverId);
      const chat = await this.privateChatModel.findOne({_id:chatId})
      .select('messages -_id')
      .lean();
      if (chat) {
        return chat;
      } else {
        return {messages:[]};
      }
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'internal server error' };
    }
  }

  async savePrivateMessage(privateMessage: SavePrivateMessageDto) {
    return this.privateChatModel.findByIdAndUpdate(
      { _id: privateMessage.chatId },
      {
        $push: {
          chatId:privateMessage.chatId,
          messages: {
            userId: new Types.ObjectId(privateMessage.message.userId),
            userName: privateMessage.message.userName,
            message: privateMessage.message.message,
            time: privateMessage.message.time,
          },
        },
      },
      { new: true, //Returns the updated document instead of the old one.
        upsert:true //Creates a new document if no match is found.
      },
    );
  }
  catch(error) {
    console.error(error);
    throw error;
  }
}

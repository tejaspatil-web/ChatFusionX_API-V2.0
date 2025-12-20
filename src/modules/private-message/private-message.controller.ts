import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PrivateMessageService } from './private-message.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ACGuard, UseRoles } from 'nest-access-control';
@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'private', version: '1' })
@UseGuards(JwtAuthGuard, ACGuard)
export class PrivateMessageController {
  constructor(private _privateChatService: PrivateMessageService) {}

  @Get('get-messages/sender/:sender/receiver/:receiver')
  @UseRoles({
    resource: 'message',
    action: 'read',
    possession: 'own',
  })
  async getPrivateMessages(
    @Param('sender') senderId: string,
    @Param('receiver') receiverId: string,
    @Res() response: Response,
  ) {
    return await this._privateChatService
      .getPrivateMessages(senderId, receiverId)
      .then((chat) => {
        response.status(HttpStatus.OK).send(chat);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  //   @Post('save-message')
  //   async savePrivateMessage(@Res() response: Response,@Body() privateMessage: SavePrivateMessageDto){
  //    return await this._privateChatService.savePrivateMessage(privateMessage).then()
  //   }
}

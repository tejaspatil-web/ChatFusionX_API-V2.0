import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SaveMessageDto } from 'src/modules/group/dtos/group.dto';
import { GroupService } from 'src/modules/group/group.service';
import { SavePrivateMessageDto } from 'src/modules/private-message/dtos/private-chat.dto';
import { PrivateMessageService } from 'src/modules/private-message/private-message.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class SocketService {

  constructor(
    private _groupService:GroupService,
    private _userService:UserService,
    private _privateMessageService:PrivateMessageService
  ){}

 async saveGroupMessages(message:SaveMessageDto){
 return this._groupService.saveGroupMessages(message)
 }

 generateChatId(senderId:string,receiverId:string):string{
 return this._privateMessageService.generateChatId(senderId,receiverId)
 }

 async savePrivateMessages(message:SavePrivateMessageDto){
 return this._privateMessageService.savePrivateMessage(message)
 }

}

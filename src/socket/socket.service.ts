import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SaveMessageDto } from 'src/modules/group/dtos/group.dto';
import { GroupService } from 'src/modules/group/group.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class SocketService {

  constructor(private _groupService:GroupService,private _userService:UserService){}

 async saveGroupMessages(message:SaveMessageDto){
 return this._groupService.saveGroupMessages(message)
 }

}

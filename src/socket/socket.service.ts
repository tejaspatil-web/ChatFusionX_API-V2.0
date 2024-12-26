import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SaveMessageDto } from 'src/modules/group/dtos/group.dto';
import { GroupService } from 'src/modules/group/group.service';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(private _groupService:GroupService){}

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });
  }

 saveGroupMessages(message:SaveMessageDto){
 return this._groupService.saveGroupMessages(message)
 }

}

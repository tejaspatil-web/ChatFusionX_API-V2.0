import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { SaveMessageDto } from 'src/modules/group/dtos/group.dto';

@WebSocketGateway({
  namespace: 'getway',
  cors: {
    origin: ['http://localhost:4200', 'https://chatfusionx.web.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

 constructor(private _socketService:SocketService){}

  @WebSocketServer() private server: Socket;

  handleConnection(socket: Socket): void {
    console.log('Client connected:', socket.id);
  }

  handleDisconnect(socket: Socket): void {
    console.log('Client disconnected:', socket.id);
  }

  @SubscribeMessage('groupMessage')
  handleMessage(socket: Socket, message: SaveMessageDto): void {
    console.log('Received message:', message);
    this._socketService.saveGroupMessages(message).then(res =>{
      console.log(res)
      socket.broadcast.emit(message.groupId, message);
    }).catch(error =>{
      socket.broadcast.emit(message.groupId,'getting error while saving message');
    });
  }

  @SubscribeMessage('joinGroup')
  handlejoinGroup(socket: Socket, groupId: any): void {
    console.log('Received message:', groupId);
    socket.join(groupId);
  }
}

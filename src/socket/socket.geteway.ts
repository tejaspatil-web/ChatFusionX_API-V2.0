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

  @SubscribeMessage('joinGroups')
  handleJoinGroup(socket: Socket, groupIds: string[]): void {
    console.log('Received message:', groupIds);
    groupIds.forEach(id =>{
      socket.join(id);
    })
  }

  @SubscribeMessage('groupMessage')
  handleMessage(socket: Socket, message: SaveMessageDto): void {
    console.log('Received message:', message);
    //calling service to save messages
    this._socketService.saveGroupMessages(message).then(res =>{
      console.log(res)
      // socket.broadcast.emit(message.groupId, message);
      socket.to(message.groupId).emit('messageReceived',message)
    }).catch(error =>{
      socket.broadcast.emit(message.groupId,'getting error while saving message');
    });
  }
}

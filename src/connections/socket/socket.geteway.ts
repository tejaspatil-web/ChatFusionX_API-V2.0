import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'getway',
  cors: {
    origin: ['http://localhost:4200', 'https://chatfusionx.web.app/'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server: Socket;

  handleConnection(socket: Socket): void {
    console.log('Client connected:', socket.id);
  }

  handleDisconnect(socket: Socket): void {
    console.log('Client disconnected:', socket.id);
  }

  @SubscribeMessage('groupMessage')
  handleMessage(socket: Socket, data: any): void {
    console.log('Received message:', data);
    socket.broadcast.emit(data.groupId, data.message);
  }

  @SubscribeMessage('joinGroup')
  handlejoinGroup(socket: Socket, groupId: any): void {
    console.log('Received message:', groupId);
    socket.join(groupId);
  }
}

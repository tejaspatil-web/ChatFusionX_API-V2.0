import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
  constructor(private _socketService: SocketService) {}

  @WebSocketServer() 
  private _server: Server;
  private readonly connectedClients: Map<string, string> = new Map();

  handleConnection(socket: Socket): void {
    const userId = socket.handshake.query.userId as string;
    if (!userId) {
      console.error(`Connection failed: Missing userId for socket ${socket.id}`);
      socket.disconnect();
      return;
    }
    console.log(`Client connected: ${socket.id}, userId: ${userId}`);
    this.connectedClients.set(socket.id, userId);
    this.emitOnlineUsers()
  }
  
  handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
    const userId = this.connectedClients.get(socket.id);
    if (userId) {
      console.log(`User disconnected: ${userId}`);
      this.connectedClients.delete(socket.id);
      this.emitOnlineUsers()
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(socket: Socket): void {
    this.emitOnlineUsers();
  }

  private emitOnlineUsers(): void {
    const onlineUsers = Array.from(this.connectedClients.values());
    this._server.emit('onlineUsers', onlineUsers); // Broadcast to all clients
  }

  //Group Section
  @SubscribeMessage('joinGroups')
  handleJoinGroup(socket: Socket, groupIds: string[]): void {
    console.log('Received message:', groupIds);
    groupIds.forEach((id) => {
      socket.join(id);
    });
  }

  @SubscribeMessage('groupMessage')
  handleGroupMessage(socket: Socket, message: SaveMessageDto): void {
    console.log('Received message:', message);
    //calling service to save messages
    this._socketService
      .saveGroupMessages(message)
      .then((res) => {
        console.log(res);
        // socket.broadcast.emit(message.groupId, message);
        socket.to(message.groupId).emit('messageReceived', message);
      })
      .catch((error) => {
        socket.broadcast.emit(
          message.groupId,
          'getting error while saving message',
        );
      });
  }
}

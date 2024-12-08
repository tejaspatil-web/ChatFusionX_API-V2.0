import { Module, OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.geteway';
@Module({
  imports: [],
  providers: [SocketGateway, SocketService],
})
export class SocketModule implements OnModuleInit {
  constructor() {}
  onModuleInit() {}
}

import { Module, OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.geteway';
import { GroupModule } from 'src/modules/group/group.module';
import { UserModule } from 'src/modules/user/user.module';
import { PrivateMessageModule } from 'src/modules/private-message/private-message.module';
@Module({
  imports: [GroupModule,UserModule,PrivateMessageModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule implements OnModuleInit {
  constructor() {}
  onModuleInit() {}
}

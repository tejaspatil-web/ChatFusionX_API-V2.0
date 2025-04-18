import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.schema';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema, collection: 'group_details' },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
    }),
    UserModule,
  ],
  controllers: [GroupController],
  providers: [GroupService, JwtAuthGuard],
  exports: [GroupService],
})
export class GroupModule {
  constructor() {}
}

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from 'src/connections/cloudinary/cloudinary.provider';
import { PrivateMessageModule } from '../private-message/private-message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'user_details' },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
    PrivateMessageModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard, CloudinaryService, CloudinaryProvider],
  exports: [UserService],
})
export class UserModule {
  constructor() {}
}

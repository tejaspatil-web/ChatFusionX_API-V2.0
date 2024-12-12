import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { OtpService } from './services/otp.service';
import { OtpController } from './controllers/otp.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema, collection: 'otp_controller' },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class AuthModule {
  constructor() {}
}

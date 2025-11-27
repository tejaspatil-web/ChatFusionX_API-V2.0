import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { OtpService } from './services/otp.service';
import { OtpController } from './controllers/otp.controller';
import { UserModule } from 'src/modules/user/user.module';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleAuthService } from './services/google-auth.service';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema, collection: 'otp_controller' },
    ]),
  ],
  controllers: [OtpController,GoogleAuthController],
  providers: [OtpService,GoogleAuthService],
})
export class AuthModule {
  constructor() {}
}

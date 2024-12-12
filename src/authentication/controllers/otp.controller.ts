import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { sendEmailDto, verifyOtpDto } from '../dtos/otp.dto';
import { Response } from 'express';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from 'src/modules/user/dtos/user.dto';

@Controller({ path: 'otp', version: '1' })
export class OtpController {
  constructor(
    private otpService: OtpService,
    private userService: UserService,
  ) {}

  @Post('send')
  async sendOtpEmail(
    @Res() response: Response,
    @Body() sendEmailDto: sendEmailDto,
  ) {
    return this.otpService
      .sendOtpEmail(sendEmailDto)
      .then((res) => {
        response.status(HttpStatus.CREATED).send({
          message:
            'OTP has been sent to your email address. Please check your inbox to verify.',
        });
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('verify')
  async verifyOtp(
    @Res() response: Response,
    @Body() sendEmailDto: CreateUserDto,
  ) {
    try {
      // First, verify the OTP
      await this.otpService.verifyOtp(sendEmailDto);

      // Then, create the user if OTP is valid
      const user = await this.userService.createUser(sendEmailDto);

      // Return a success response if everything works
      return response
        .status(HttpStatus.CREATED)
        .send({ message: 'User signed up successfully', user });
    } catch (error) {
      // Handle any error during OTP verification or user creation
      console.error(error);
      throw new HttpException(
        error.message || 'Something went wrong during sign-up',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

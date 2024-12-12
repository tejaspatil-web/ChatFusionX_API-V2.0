import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '../schemas/otp.schema';
import { Model } from 'mongoose';
import { createTransport } from 'nodemailer';
import { sendEmailDto, verifyOtpDto } from '../dtos/otp.dto';
import { generateOtp } from 'src/utils/common-utils';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { CreateUserDto } from 'src/modules/user/dtos/user.dto';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private readonly OtpModel: Model<Otp>) {}

  async sendOtpEmail(sendEmailDto: sendEmailDto): Promise<void> {
    const otp = generateOtp();

    // Path to the HTML template file
    const templatePath = path.join(
      __dirname,
      '../../templates/otp-template.html',
    );

    // Read the HTML template from the file
    const templateSource = fs.readFileSync(templatePath, 'utf-8');

    // Compile the template with Handlebars
    const template = handlebars.compile(templateSource);

    // Inject dynamic data (name, OTP, and year) into the template
    const htmlContent = template({
      userName: sendEmailDto.userName,
      otp,
      year: new Date().getFullYear(),
    });

    const transporter = createTransport({
      service: 'gmail',
      secure: true,
      port: process.env.EMAILPORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"ChatfusionX" <no-reply@chatfusionx.com>',
      to: sendEmailDto.email,
      subject: 'One-time verification code',
      html: htmlContent,
    };

    try {
      await this.saveOtp(sendEmailDto.email, otp);
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${sendEmailDto.email}`);
    } catch (error) {
      throw new HttpException(
        `Failed to send OTP email to ${sendEmailDto.email}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async saveOtp(email: string, otp: string): Promise<Otp> {
    const otpDoc = new this.OtpModel({
      email: email,
      otp: otp,
    });
    return await otpDoc.save();
  }

  async verifyOtp(verifyOtpDto: CreateUserDto): Promise<boolean> {
    try {
      // Find the OTP document by email and OTP
      const storedOtp = await this.OtpModel.findOne({
        email: verifyOtpDto.email,
        otp: verifyOtpDto.otp,
      });

      // If OTP is not found, throw a custom error for invalid OTP
      if (!storedOtp) {
        throw new HttpException(
          'Invalid OTP entered',
          HttpStatus.BAD_REQUEST, // 400 status code for invalid OTP
        );
      }

      // If OTP is valid, delete it after verification
      await storedOtp.deleteOne();

      return true; // OTP is valid and deleted
    } catch (error) {
      // If any unexpected error occurs, log it and throw a 500 internal server error
      console.error('Error verifying OTP:', error);

      // Check if the error is an HttpException already thrown earlier
      if (error instanceof HttpException) {
        // If it's an HttpException, rethrow it so the message stays the same
        throw error;
      }

      // Otherwise, throw a generic internal server error for unexpected errors
      throw new HttpException(
        'OTP verification failed due to an internal error',
        HttpStatus.INTERNAL_SERVER_ERROR, // 500 status code for internal server error
      );
    }
  }
}

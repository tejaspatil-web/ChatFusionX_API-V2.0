import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '../schemas/otp.schema';
import { Model } from 'mongoose';
import { createTransport } from 'nodemailer';
import { resetPasswordDto, sendEmailDto } from '../dtos/otp.dto';
import { generateOtp } from 'src/utils/common-utils';
import * as handlebars from 'handlebars';
import { CreateUserDto } from 'src/modules/user/dtos/user.dto';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private readonly OtpModel: Model<Otp>) {}

  async sendOtpEmail(sendEmailDto: sendEmailDto): Promise<void> {
    const otp = generateOtp();

    // Compile the template with Handlebars
    const template = handlebars.compile(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      color: #333;
    "
  >
    <table
      style="
        width: 100%;
        max-width: 600px;
        margin: 20px auto;
        border-collapse: collapse;
      "
    >
      <tr>
        <td>
          <div
            class="email-container"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            "
          >
            <!-- Header -->
            <div
              class="header"
              style="
                background-color: #816efd;
                color: #ffffff;
                text-align: center;
                padding: 20px;
              "
            >
              <h1 style="margin: 0">OTP Verification</h1>
            </div>
            <!-- Body -->
            <div class="body" style="padding: 20px; text-align: center">
              <p style="margin: 0">Hello {{userName}},</p>
              <p style="margin: 10px 0">
                We received a request to verify your account. Please use the OTP
                below to complete your verification:
              </p>
              <div
                class="otp-code"
                style="
                  font-size: 24px;
                  font-weight: bold;
                  color: #333;
                  background-color: #f4f4f4;
                  padding: 15px;
                  border-radius: 5px;
                  margin-top: 10px;
                "
              >
                {{otp}}
              </div>
              <p style="margin: 10px 0">This OTP will expire in 10 minutes.</p>
              <p style="margin: 10px 0">
                If you did not request this verification, please ignore this
                email.
              </p>
            </div>
            <!-- Footer -->
            <div
              class="footer"
              style="
                background-color: #f7f7f7;
                color: #777;
                font-size: 12px;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #ddd;
              "
            >
              <p style="margin: 0">
                &copy; {{year}} ChatFusionX. All rights reserved.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`);

    // Inject dynamic data (name, OTP, and year) into the template
    const htmlContent = template({
      userName: sendEmailDto.userName,
      otp,
      year: new Date().getFullYear(),
    });

    // const transporter = createTransport({
    //   service: 'gmail',
    //   secure: true,
    //   port: process.env.EMAILPORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

      const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // CRITICAL: Must be false for port 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // Must be App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    const mailOptions = {
      from: '"ChatFusionX" <chatfusionx@gmail.com>',
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

  async sendEmailResetPassword(resetPasswordDto: resetPasswordDto): Promise<void> {
    // Compile the template with Handlebars
    const template = handlebars.compile(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Recovery</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background-color: #816efd; color: #ffffff; text-align: center; padding: 20px; font-size: 24px; font-weight: bold;">
              Password Recovery
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #333333; line-height: 1.6;">
              <p style="margin: 0 0 15px;">Dear {{userName}},</p>
              <p style="margin: 0 0 15px;">You requested your password. Below are your login credentials:</p>
              <p style="margin: 0 0 15px; font-weight: bold;">Email: <span style="color: #816efd;">{{email}}</span></p>
              <p style="margin: 0 0 15px; font-weight: bold;">Password: <span style="color: #816efd;">{{password}}</span></p>
              <p style="margin: 0 0 15px;">If you did not request this email, please contact our support team immediately.</p>
              <p style="margin: 0;">Thank you,</p>
              <p style="margin: 0;">The Support Team</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #888888;">
              &copy; {{year}} ChatFusionX. All rights reserved
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`);

    // Inject dynamic data (name, OTP, and year) into the template
    const htmlContent = template({
      userName: resetPasswordDto.userName,
      year: new Date().getFullYear(),
      email:resetPasswordDto.email,
      password:resetPasswordDto.password
    });

    // const transporter = createTransport({
    //   service: 'gmail',
    //   secure: true,
    //   port: process.env.EMAILPORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // CRITICAL: Must be false for port 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // Must be App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: '"ChatFusionX" <chatfusionx@gmail.com>',
      to: resetPasswordDto.email,
      subject: 'Your New Password for Account Access',
      html: htmlContent,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`recovery email sent to ${resetPasswordDto.email}`);
    } catch (error) {
      throw new Error(error);
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

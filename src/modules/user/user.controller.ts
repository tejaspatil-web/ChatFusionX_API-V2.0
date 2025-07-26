import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CloudinaryService } from './cloudinary.service';
import {
  AcceptRequestDto,
  AddRequestDto,
  RejectRequestDto,
  updatePasswordDto,
  ValidateUserDto,
} from './dtos/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('getAll')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Res() response: Response) {
    return this.userService
      .getAllUsers()
      .then((res) => {
        response.status(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Get('getUser/:id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string, @Res() response: Response) {
    return this.userService
      .getUserDetails(id)
      .then((res) => {
        response.status(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  // @Post('register')
  // async createUser(
  //   @Res() response: Response,
  //   @Body() createUserDto: CreateUserDto,
  // ) {
  //   return this.userService
  //     .createUser(createUserDto)
  //     .then((res) => {
  //       response
  //         .status(HttpStatus.CREATED)
  //         .send({ message: 'User Saved Successfully' });
  //     })
  //     .catch((error: HttpException) => {
  //       console.error(error);
  //       throw new HttpException(error.message, error.getStatus());
  //     });
  // }

  @Post('validate')
  async validateUser(
    @Res() response: Response,
    @Body() userData: ValidateUserDto,
  ) {
    return await this.userService
      .validateUser(userData)
      .then((data) => {
        if (data.isUserValid) {
          response.status(HttpStatus.OK).send(data.userDetails);
        } else {
          throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
        }
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('updatePassword')
  async updatePassword(
    @Res() response: Response,
    @Body() updatePasswordDto: updatePasswordDto,
  ) {
    return this.userService
      .updatePassword(updatePasswordDto)
      .then((res) => {
        response
          .status(HttpStatus.OK)
          .send({ message: 'Password Updated Successfully' });
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('sendRequest')
  @UseGuards(JwtAuthGuard)
  async addRequest(@Res() response: Response, @Body() userData: AddRequestDto) {
    return await this.userService
      .addRequest(userData)
      .then((data) => {
        response.status(HttpStatus.OK).send(data);
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('acceptRequest')
  @UseGuards(JwtAuthGuard)
  async acceptRequest(
    @Res() response: Response,
    @Body() userData: AcceptRequestDto,
  ) {
    return await this.userService
      .acceptRequest(userData)
      .then((data) => {
        response.status(HttpStatus.OK).send(data);
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('rejectRequest')
  @UseGuards(JwtAuthGuard)
  async rejectRequest(
    @Res() response: Response,
    @Body() userData: RejectRequestDto,
  ) {
    return await this.userService
      .rejectRequest(userData)
      .then((data) => {
        response.status(HttpStatus.OK).send(data);
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('upload-profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: any,
    @Body('userName') userName: string,
    @Body('userId') userId: string,
  ) {
    let result: any;
    try {
      if (file) {
        result = await this.cloudinaryService.uploadUserProfile(file);
        await this.userService.updateProfileUrl(
          userId,
          result?.secure_url || '',
        );
      }
      await this.userService.updateUserName(userId, userName);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus());
    }
    return { url: result?.secure_url || '' };
  }
}

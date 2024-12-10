import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto, ValidateUserDto } from './dtos/user.dto';

@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(@Res() response: Response) {
    return this.userService
      .getAllUsers()
      .then((res) => {
        response.status(HttpStatus.OK).send({ data: res });
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Post('register')
  async createUser(
    @Res() response: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService
      .createUser(createUserDto)
      .then((res) => {
        response
          .status(HttpStatus.CREATED)
          .send({ message: 'User Saved Successfully' });
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }

  @Post('validate')
  async validateUser(
    @Res() response: Response,
    @Body() userData: ValidateUserDto,
  ) {
    return await this.userService
      .validateUser(userData)
      .then((data) => {
        if (data.isUserValid) {
          response.status(HttpStatus.OK).send(data);
        } else {
          throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
        }
      })
      .catch((error: HttpException) => {
        console.error(error);
        throw new HttpException(error.message, error.getStatus());
      });
  }
}

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
import { CreateUserDto } from './dtos/user.dto';

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
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Post()
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
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}

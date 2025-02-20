import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { AcceptRequestDto, AddRequestDto, CreateUserDto, RejectRequestDto, ValidateUserDto } from './dtos/user.dto';

@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getAll')
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
  async getUser(@Param('id') id:string,@Res() response: Response) {
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


  @Post('sendRequest')
  async addRequest(
    @Res() response: Response,
    @Body() userData: AddRequestDto,
  ) {
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
}

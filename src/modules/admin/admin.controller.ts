import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UpdateUserDto } from './dtos/admin.dto';
import { ACGuard, UseRoles } from 'nest-access-control';

@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, ACGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('getAll')
  @UseRoles({
    resource: 'admin',
    action: 'read',
    possession: 'any',
  })
  async getAllUsers(@Res() response: Response) {
    return this.adminService
      .getAllUsers()
      .then((res) => {
        response.status(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Delete('delete/:id')
  @UseRoles({
    resource: 'user',
    action: 'delete',
    possession: 'any',
  })
  @UseGuards(JwtAuthGuard)
  async deletUser(@Param('id') id: string, @Res() response: Response) {
    return this.adminService
      .deleteUser(id)
      .then((res) => {
        response
          .status(HttpStatus.OK)
          .send({ res: 'User Deleted successfully' });
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Post('update-user')
  @UseRoles({
    resource: 'user',
    action: 'update',
    possession: 'any',
  })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Res() response: Response,
    @Body()
    userData: UpdateUserDto,
  ) {
    return this.adminService
      .updateUser(userData)
      .then((res) => {
        response
          .status(HttpStatus.OK)
          .send({ res: 'User Updated successfully' });
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}

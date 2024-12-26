import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller({ path: '', version: '1' })
export class AppController {
  constructor() {}

  @Get('serverStatus')
  async serverStatus(@Res() response: Response) {
    try {
      return response.status(HttpStatus.OK).send({ message: 'Server is awake and running' });
    } catch (error) {
      console.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

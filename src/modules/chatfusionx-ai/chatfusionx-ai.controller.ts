import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ChatFusionXAIService } from './chatfusionx-ai.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'chatfusionx-ai', version: '1' })
@UseGuards(JwtAuthGuard)
export class ChatFusionXAIController {
  constructor(private readonly aiService: ChatFusionXAIService) {}

  @Get('get-chat')
  async getChat(
  @Query('user_id') userId: string, 
  @Res() response:Response) {
    return await this.aiService.getChat(userId).then(res =>{
      response.status(HttpStatus.OK).send({response:res})
    }).catch(error =>{
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    })
  }

  @Post('generate')
  async generate(
  @Body('user_id') userId: string, 
  @Body('prompt') prompt: string,
  @Res() response:Response) {
    return await this.aiService.getAiResponse(userId,prompt).then(res =>{
      response.status(HttpStatus.OK).send({response:res})
    }).catch(error =>{
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    })
  }
}

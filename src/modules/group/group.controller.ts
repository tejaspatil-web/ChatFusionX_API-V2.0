import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto, GetAllGroupsDto, JoinGroupDto } from './dtos/group.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'group', version: '1' })
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService:GroupService) {}


  @Post('create')
  async createGroup(
    @Res() response: Response,
    @Body() createGroupData: CreateGroupDto,
  ) {
    return await this.groupService.createGroup(createGroupData).then(res =>{
        response.status(HttpStatus.OK).send({response:res})
    }).catch(error =>{
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    })
  }
  
  @Post('join')
  async joinGroup(
    @Res() response: Response,
    @Body() joinGroupData: JoinGroupDto,
  ) {
    return await this.groupService.joinGroup(joinGroupData).then(res =>{
        response.status(HttpStatus.OK).send(res)
    }).catch(error =>{
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    })
  }

  @Post('getAllJoinedGroup')
  async getAllGroups(
    @Res() response: Response,
    @Body() groupIds: GetAllGroupsDto,
  ) {
    return await this.groupService.getGroupsByIds(groupIds).then(res =>{
        response.status(HttpStatus.OK).send(res)
    }).catch(error =>{
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    })
  }
}

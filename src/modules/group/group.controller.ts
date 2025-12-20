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
import {
  CreateGroupDto,
  GetAllGroupsDto,
  JoinGroupDto,
} from './dtos/group.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ACGuard, UseRoles } from 'nest-access-control';

@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'group', version: '1' })
@UseGuards(JwtAuthGuard, ACGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('create')
  @UseRoles({
    resource: 'group',
    action: 'create',
    possession: 'own',
  })
  async createGroup(
    @Res() response: Response,
    @Body() createGroupData: CreateGroupDto,
  ) {
    return await this.groupService
      .createGroup(createGroupData)
      .then((res) => {
        response.status(HttpStatus.OK).send({ response: res });
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Post('join')
  @UseRoles({
    resource: 'group',
    action: 'update',
    possession: 'own',
  })
  async joinGroup(
    @Res() response: Response,
    @Body() joinGroupData: JoinGroupDto,
  ) {
    return await this.groupService
      .joinGroup(joinGroupData)
      .then((res) => {
        response.status(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Post('getAllJoinedGroup')
  @UseRoles({
    resource: 'group',
    action: 'read',
    possession: 'own',
  })
  async getAllGroups(
    @Res() response: Response,
    @Body() groupIds: GetAllGroupsDto,
  ) {
    return await this.groupService
      .getGroupsByIds(groupIds)
      .then((res) => {
        response.status(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        console.error(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}

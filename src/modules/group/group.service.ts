import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from './group.schema';
import { CreateGroupDto, GetAllGroupsDto, JoinGroupDto, SaveMessageDto } from './dtos/group.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly userService: UserService,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto) {
    try {
      const {userId,name,description} = createGroupDto
      // Create the group
      const group = new this.groupModel({
        name,
        description,
        createdBy: userId,
        admins: [userId],
        members: [userId],
      });
  
      const savedGroup = await group.save();
  
  // Update the user with the group ID
  await this.userService.assignGroupToUser(userId, savedGroup._id.toString());
  
      return savedGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }
  

  async joinGroup(groupData:JoinGroupDto) {
    try {
      const groupObjectId = new Types.ObjectId(groupData.groupId);
      const userObjectId = new Types.ObjectId(groupData.userId);

      // Add user to the group
      const group = await this.groupModel.findByIdAndUpdate(
        groupObjectId,
        {
          $addToSet: { members: userObjectId },
        },
        { new: true,select: 'name _Id description' }
      );

      // Add the group ID
      await this.userService.addGroupToUser(groupData.userId, groupObjectId);

      return group;
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }

  async getGroupsByIds(groupIds: GetAllGroupsDto) {
    try {
      // Convert string IDs to ObjectIds
      const objectIds = groupIds.groupIds.map((id) => new Types.ObjectId(id));
  
      const groups = await this.groupModel.find({
        _id: { $in: objectIds },
      })
      .sort({createdAt: -1})
      .select('_id name description messages');
  
      return groups;
    } catch (error) {
      console.error('Error fetching groups by IDs:', error);
      throw error;
    }
  }
  

  async saveGroupMessages(message:SaveMessageDto){
    try{
     return this.groupModel.findByIdAndUpdate(message.groupId,{
      $push:{messages:{
        userId:new Types.ObjectId(message.userId),
        userName:message.userName,
        message:message.message,
        time:message.time
      },
    }
  },
  {new:true})
    }catch(error){
      console.error(error);
      throw error;
    }
  }

}

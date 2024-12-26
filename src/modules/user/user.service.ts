import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto, ValidateUserDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from 'src/utils/common-utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    const createUser = new this.userModel(createUserDto);
    return await createUser.save();
  }

  async validateUser(
    userData: ValidateUserDto,
  ): Promise<{ isUserValid: boolean,userDetails:any }> {
    const { email, password } = userData;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const isValid = await bcrypt.compare(password, user.password);
    return { isUserValid: isValid,userDetails:user };
  }


  async assignGroupToUser(userId: string, groupId: string) {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $push: {
          adminGroupIds: groupId,
          joinedGroupIds: groupId,
        },
      });
    } catch (error) {
      console.error('Error updating user with group ID:', error);
      throw error;
    }
  }

  async addGroupToUser(userId: string, groupId: Types.ObjectId) {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { joinedGroupIds: groupId }
      });
    } catch (error) {
      console.error('Error updating user with group ID:', error);
      throw error;
    }
  }

  async resetPassword(email:string): Promise<{password:string,user:User}> {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      await user.updateOne({ password: hashedPassword });
      return { password: randomPassword, user };
    }else{
      throw {status:404,message:'User not found'}
    }
  }
}

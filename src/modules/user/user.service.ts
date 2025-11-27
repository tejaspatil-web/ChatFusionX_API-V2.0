import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import {
  AcceptRequestDto,
  AddRequestDto,
  CreateUserDto,
  RejectRequestDto,
  updatePasswordDto,
  ValidateUserDto,
} from './dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from 'src/utils/common-utils';
import { JwtService } from '@nestjs/jwt';
import { PrivateMessageService } from '../private-message/private-message.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private _privateChatService: PrivateMessageService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .select('_id email name profileUrl')
      .exec();
  }

  async getUserDetails(userId: string): Promise<User> {
    return await this.userModel.findOne({ _id: userId });
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
  ): Promise<{ token: string; isUserValid: boolean; userDetails: any }> {
    const { email, password } = userData;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const isValid = await bcrypt.compare(password, user.password);
    let token = '';
    if (isValid) {
      token = await this.generateJwtToken(user.id);
    }
    const userDetails = {
      addedUsers: user.addedUsers,
      adminGroupIds: user.adminGroupIds,
      email: user.email,
      id: user.id,
      joinedGroupIds: user.joinedGroupIds,
      name: user.name,
      profileUrl: user.profileUrl || '',
      requestPending: user.requestPending,
      requests: user.requests,
      accessToken: token,
    };
    return { token: token, isUserValid: isValid, userDetails: userDetails };
  }

  async googleWithGoogle(userDetails: CreateUserDto) {
    let user = await this.userModel.findOne({ email: userDetails.email });

    // If user not found then create
    if (!user) {
      user = await this.userModel.create(userDetails);
    }

    const token = await this.generateJwtToken(user.id);

    const responseUser = {
      addedUsers: user.addedUsers,
      adminGroupIds: user.adminGroupIds,
      email: user.email,
      id: user.id,
      joinedGroupIds: user.joinedGroupIds,
      name: user.name,
      profileUrl: user.profileUrl || "",
      requestPending: user.requestPending,
      requests: user.requests,
      accessToken: token,
    };

    return {
      token,
      isUserValid: true,
      userDetails: responseUser,
    };
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
        $addToSet: { joinedGroupIds: groupId },
      });
    } catch (error) {
      console.error('Error updating user with group ID:', error);
      throw error;
    }
  }

  async updatePassword(updatePassword: updatePasswordDto): Promise<User> {
    const { userId, oldPassword, newPassword } = updatePassword;
    const objectId = new Types.ObjectId(userId);
    const user = await this.userModel.findOne({ _id: objectId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new HttpException(
        'Entered wrong old password.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    return await user.save();
  }

  async addRequest(userData: AddRequestDto): Promise<void> {
    try {
      await Promise.all([
        this.userModel.findByIdAndUpdate(userData.userId, {
          $addToSet: { requestPending: userData.requestUserId },
        }),
        this.userModel.findByIdAndUpdate(userData.requestUserId, {
          $addToSet: { requests: userData.userId },
        }),
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async acceptRequest(userData: AcceptRequestDto): Promise<void> {
    try {
      await Promise.all([
        this.userModel.findByIdAndUpdate(userData.userId, {
          $addToSet: { addedUsers: userData.acceptUserId },
          $pull: { requests: userData.acceptUserId },
        }),
        this.userModel.findByIdAndUpdate(userData.acceptUserId, {
          $addToSet: { addedUsers: userData.userId },
          $pull: { requestPending: userData.userId },
        }),
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async rejectRequest(userData: RejectRequestDto): Promise<void> {
    try {
      await Promise.all([
        this.userModel.findByIdAndUpdate(userData.userId, {
          $pull: { requests: userData.rejectUserId },
        }),
        this.userModel.findByIdAndUpdate(userData.rejectUserId, {
          $pull: { requestPending: userData.userId },
        }),
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resetPassword(
    email: string,
  ): Promise<{ password: string; user: User }> {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      await user.updateOne({ password: hashedPassword });
      return { password: randomPassword, user };
    } else {
      throw { status: 404, message: 'User not found' };
    }
  }

  async generateJwtToken(userId: string): Promise<string> {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5h',
    });
  }

  async updateUserName(userId: string, userName: string) {
    if (userId && userName) {
      try {
        const nameUpdated = await this.userModel.updateOne(
          { _id: userId },
          { $set: { name: userName } },
        );
        const result = await this._privateChatService.updateUserName(
          userId,
          userName,
        );
        return { nameUpdated, result };
      } catch (error) {
        throw { status: 500, message: 'getting error while update username' };
      }
    }
  }

  async updateProfileUrl(userId: string, profileUrl: string) {
    const userObjectId = new Types.ObjectId(userId);
    const updateResult = await this.userModel.updateOne(
      { _id: userObjectId },
      { $set: { profileUrl } },
    );
    return updateResult;
  }
}

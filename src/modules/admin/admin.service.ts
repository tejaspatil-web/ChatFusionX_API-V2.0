import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .select('_id email name profileUrl')
      .exec();
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { isDeleted: true } },
    );

    if (result.matchedCount === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(data: UpdateUserDto): Promise<User> {
    const { id, name, email, password } = data;

    // Object that will hold only fields we want to update
    const updateData: Partial<User> = {};

    // Update name only if provided
    if (name !== null) {
      updateData.name = name;
    }

    // Update email only if provided
    if (email !== null) {
      updateData.email = email;
    }

    // Update password only if provided (and hash it)
    if (password !== null) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user in DB
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}

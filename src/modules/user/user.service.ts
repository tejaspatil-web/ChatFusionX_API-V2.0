import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    async getAllUsers():Promise<User[]>{
        return await this.userModel.find().exec();
    }

    async createUser(createUserDto: CreateUserDto):Promise<User>{
        const createUser = new this.userModel(createUserDto)
        return await createUser.save();
    }
}

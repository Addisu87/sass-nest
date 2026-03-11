import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser: User = await this.UserModel.create(createUserDto);
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.UserModel.findById({ _id: id }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.UserModel.findByIdAndUpdate({ _id: id }, updateUserDto, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<User | null> {
    const deletedUser = await this.UserModel.findByIdAndDelete({
      _id: id,
    }).exec();
    return deletedUser;
  }
}

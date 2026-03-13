import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  findById(userId: number) {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  updatePassword(sub: any, hashedPassword: string) {
    throw new Error('Method not implemented.');
  }
  updateRefreshToken(userId: number, arg1: null) {
    throw new Error('Method not implemented.');
  }
  private readonly saltRounds = 10;
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );
    const createdUser: User = await this.UserModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // save user to DB
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  // async findOne(id: string): Promise<User | null> {
  //   return this.UserModel.findById({ _id: id }).exec();
  // }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
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

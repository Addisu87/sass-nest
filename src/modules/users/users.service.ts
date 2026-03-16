import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async findById(userId: number): Promise<User | undefined> {
    return (await this.userRepository.findOne({ where: { id: userId } })) ?? undefined;
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return (await this.userRepository.findOne({ where: { email } })) ?? undefined;
  }
  updatePassword(sub: number, hashedPassword: string) {
    return this.userRepository.update(sub, { password: hashedPassword });
  }
  async updateRefreshToken(userId: number, token: string | null) {
    return this.userRepository.update(userId, { refreshToken: token });
  }
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      firstName: createUserDto.username ?? '',
      lastName: '',
      fullName: createUserDto.username ?? '',
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(usernameOrId: string): Promise<User | undefined> {
    const parsedId = Number.parseInt(usernameOrId, 10);
    if (!Number.isNaN(parsedId)) {
      return (await this.userRepository.findOne({ where: { id: parsedId } })) ?? undefined;
    }
    return (await this.userRepository.findOne({ where: { username: usernameOrId } })) ?? undefined;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const { id: _, ...dto } = updateUserDto;
    await this.userRepository.update(Number(id), dto);
    return this.userRepository.findOne({ where: { id: Number(id) } }) ?? null;
  }

  async delete(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: Number(id) } });
    if (user) {
      await this.userRepository.remove(user);
    }
    return user;
  }
}

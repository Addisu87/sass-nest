import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async findById(userId: number): Promise<User | undefined> {
    return (
      (await this.userRepository.findOne({ where: { id: userId } })) ??
      undefined
    );
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return (
      (await this.userRepository.findOne({ where: { email } })) ?? undefined
    );
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
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const fullName =
      `${createUserDto.firstName ?? ''} ${createUserDto.lastName ?? ''}`.trim();

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      username: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName ?? '',
      lastName: createUserDto.lastName ?? '',
      fullName: fullName || '',
    });
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User | undefined> {
    const parsedId = Number.parseInt(username, 10);
    if (!Number.isNaN(parsedId)) {
      return (
        (await this.userRepository.findOne({ where: { id: parsedId } })) ??
        undefined
      );
    }
    return (
      (await this.userRepository.findOne({
        where: { email: username },
      })) ?? undefined
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const nextUpdate: UpdateUserDto = { ...updateUserDto };
    if (typeof nextUpdate.password === 'string' && nextUpdate.password.length) {
      nextUpdate.password = await bcrypt.hash(
        nextUpdate.password,
        this.saltRounds,
      );
    }
    if (typeof nextUpdate.email === 'string' && nextUpdate.email.length) {
      (nextUpdate as any).username = nextUpdate.email;
    }
    await this.userRepository.update(Number(id), nextUpdate);
    return this.userRepository.findOne({ where: { id: Number(id) } }) ?? null;
  }

  async delete(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });
    if (user) {
      await this.userRepository.remove(user);
    }
    return user;
  }
}

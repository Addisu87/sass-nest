import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    { provide: getRepositoryToken(User), useValue: {} },
  ],
  exports: [UsersService],
})
export class UsersModule {}

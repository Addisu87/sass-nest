import { Module } from '@nestjs/common';
import { UsersService } from './user.services';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './schema/user.schema';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [
    UsersService,
    { provide: getRepositoryToken(UserSchema), useValue: {} },
  ],
  exports: [UsersService],
})
export class UsersModule {}

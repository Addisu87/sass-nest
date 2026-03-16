import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '123', description: 'User ID' })
  readonly id?: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Username' })
  readonly username?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email address' })
  readonly email?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'Password' })
  readonly password?: string;

  @ApiPropertyOptional({ example: true, description: 'Email verification status' })
  readonly isEmailVerified?: boolean;
}

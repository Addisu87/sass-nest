import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @Column({ default: '' })
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  firstName: string;

  @Column({ default: '' })
  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @Column()
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  username: string;

  @Column({ default: '' })
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  @Column({ unique: true, default: '' })
  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @Column()
  @ApiProperty({ example: 'hashedpassword', description: 'Password (hashed)' })
  password: string;

  @Column({ default: true })
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user is active',
  })
  isActive: boolean;

  @Column({ default: false })
  @ApiPropertyOptional({
    example: false,
    description: 'Whether the user is an admin',
  })
  isAdmin: boolean;

  @Column({ type: 'varchar', nullable: true })
  @ApiPropertyOptional({ example: null, description: 'Refresh token' })
  refreshToken: string | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  @ApiPropertyOptional({
    example: false,
    description: 'Email verification status',
  })
  isEmailVerified: boolean;

  role?: unknown;
}

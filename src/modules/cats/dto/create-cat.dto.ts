import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateCatDto {
  @ApiProperty({ example: 'Whiskers', description: 'Cat name' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 3, description: 'Cat age' })
  @IsInt()
  readonly age: number;

  @ApiProperty({ example: 'Maine Coon', description: 'Cat breed' })
  @IsString()
  readonly breed: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCatDto {
  @ApiPropertyOptional({ example: 'Whiskers', description: 'Cat name' })
  readonly name?: string;

  @ApiPropertyOptional({ example: 3, description: 'Cat age' })
  readonly age?: number;

  @ApiPropertyOptional({ example: 'Maine Coon', description: 'Cat breed' })
  readonly breed?: string;
}

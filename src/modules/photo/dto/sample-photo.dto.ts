import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SamplePhotoDto {
  @ApiPropertyOptional({ example: 1, description: 'Photo ID' })
  id: number;

  @ApiProperty({ example: 'Beach Sunset', description: 'Photo name' })
  name: string;

  @ApiProperty({ example: 'A beautiful sunset at the beach', description: 'Photo description' })
  description: string;

  @ApiProperty({ example: 'beach-sunset.jpg', description: 'Filename' })
  filename: string;

  @ApiProperty({ example: 42, description: 'View count' })
  views: number;

  @ApiProperty({ example: true, description: 'Whether the photo is published' })
  isPublished: boolean;
}

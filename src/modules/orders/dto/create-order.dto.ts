import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Order #1', description: 'Order name' })
  name: string;

  @ApiProperty({ example: 'Order description', description: 'Order description' })
  description: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'Whiskers' })
  name: string;

  @Column('int')
  @ApiProperty({ example: 1, description: 'The age of the Cat' })
  age: number;

  @Column()
  @ApiProperty({ example: 'Maine Coon', description: 'The breed of the Cat' })
  breed: string;
}

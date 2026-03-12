import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Virtual } from '@nestjs/mongoose';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  username: string;

  @Virtual({
    get: function (this: User) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];
  userId: any;
  role: any;
}

import { Role } from 'src/common/enum/role.enum';

export class CreateUserDto {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  roles: Role[] = [];
  isEmailVerified: boolean;
  isEnabled?: boolean = true;
}

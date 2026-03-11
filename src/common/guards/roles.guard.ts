import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // to access the route's role(s) custom metadata,
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // To read the handlers metadata
    // const roles = this.reflector.get(Roles, context.getHandler());
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}

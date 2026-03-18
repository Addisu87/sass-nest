import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_ACCESS_SECRET') ?? this.configService.get('jwt.accessSecret') ?? '';
  }
}

@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      console.log('Authentication is enabled');
    }
  }
}

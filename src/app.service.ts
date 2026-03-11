import { Injectable } from '@nestjs/common';
import { ConfigService } from './modules/config/config.service';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }
}

@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      console.log('Authentication is enabled');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PasswordService } from 'src/modules/auth/ strategies/password.service';
import { JwtStrategy } from './ strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET') ?? 'jwt-secret',
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRATION') ? Number(config.get('JWT_ACCESS_EXPIRATION')) : '1h',
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

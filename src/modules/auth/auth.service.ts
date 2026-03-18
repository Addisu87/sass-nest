import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type StringValue } from 'ms';
import { UsersService } from 'src/modules/users/users.service';
import { PasswordService } from './strategies/password.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      isEmailVerified: false,
      roles: [],
    });

    const verifyToken = await this.jwtService.signAsync({
      sub: user.id,
    });

    console.log(`Verify email: /verify-email?token=${verifyToken}`);

    return user;
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token?: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as StringValue,
    });

    await this.usersService.updateRefreshToken(
      user.id,
      await this.passwordService.hashPassword(refreshToken),
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let payload: { sub: number; email: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await this.passwordService.comparePassword(
      refreshToken,
      user.refreshToken,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as StringValue,
      },
    );

    await this.usersService.updateRefreshToken(
      user.id,
      await this.passwordService.hashPassword(newRefreshToken),
    );

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }

  async sendResetLink(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return;

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    // send email
    console.log(`Reset link: /reset-password?token=${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.jwtService.verifyAsync(token);

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    await this.usersService.updatePassword(payload.sub, hashedPassword);

    return { message: 'Password updated' };
  }

  async verifyEmail(token: string) {
    const payload = await this.jwtService.verifyAsync(token);

    await this.usersService.update(String(payload.sub), {
      isEmailVerified: true,
    });

    return { message: 'Email verified successfully' };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}

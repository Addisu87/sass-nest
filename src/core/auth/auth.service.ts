import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/core/users/users.service';
import { PasswordService } from 'src/common/password.service';

@Injectable()
export class AuthService {
  refreshToken(token: string) {
    throw new Error('Method not implemented.');
  }
  private readonly saltRounds = 10;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(username: string, password: string) {
    const hashedPassword = await this.passwordService.hashPassword(password);

    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      isEmailVerified: false,
      email: '',
    });

    const verifyToken = await this.jwtService.signAsync({
      sub: user.id,
    });

    console.log(`Verify email: /verify-email?token=${verifyToken}`);

    return user;
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
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

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION?.toString(),
    });

    // Here the JWT secret key that's used for signing the payload
    // is the key that was passed in the JwtModule
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: number, token: string) {
    const user = await this.usersService.findById(userId);

    const isValid = await this.passwordService.comparePassword(
      token,
      user.refreshToken,
    );

    if (!isValid) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
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

    await this.usersService.update(payload.sub, {
      isEmailVerified: true,
    });

    return { message: 'Email verified successfully' };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}

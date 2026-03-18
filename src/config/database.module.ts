import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const synchronize =
          configService.get<boolean>('database.synchronize') ??
          (configService.get<string>('app.env') ?? 'development') !== 'production';

        const url = configService.get<string>('database.url');
        if (url) {
          return {
            type: 'postgres' as const,
            url,
            autoLoadEntities: true,
            synchronize,
          };
        }

        return {
          type: 'postgres' as const,
          host: configService.getOrThrow<string>('database.host'),
          port: configService.getOrThrow<number>('database.port'),
          username: configService.getOrThrow<string>('database.username'),
          password: configService.getOrThrow<string>('database.password'),
          database: configService.getOrThrow<string>('database.name'),
          autoLoadEntities: true,
          synchronize,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

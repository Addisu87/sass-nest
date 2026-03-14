import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Cat]),
    HttpModule.register({
      timeout: Number.parseInt(process.env.HTTP_TIMEOUT ?? '5000', 10),
      maxRedirects: Number.parseInt(process.env.HTTP_MAX_REDIRECTS ?? '5', 10),
    }),
  ],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

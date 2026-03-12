import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './schemas/cat.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cat.name,
        schema: CatSchema,
      },
    ]),
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

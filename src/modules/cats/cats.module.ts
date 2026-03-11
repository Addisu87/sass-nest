import { Global, Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from 'src/modules/cats/schemas/cat.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
  controllers: [CatsController],
  providers: [
    CatsService,
    {
      provide: getModelToken(Cat.name),
      useValue: catModel,
    },
  ],
  exports: [CatsService],
})
export class CatsModule {}

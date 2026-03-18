import { Test, TestingModule } from '@nestjs/testing';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';

describe('PhotoController', () => {
  let controller: PhotoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoController],
      providers: [
        PhotoService,
        {
          provide: getRepositoryToken(Photo),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PhotoController>(PhotoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

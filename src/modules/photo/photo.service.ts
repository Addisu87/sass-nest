import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}
  create(createPhotoDto: CreatePhotoDto) {
    return this.photoRepository.create(createPhotoDto);
  }

  findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }

  findOne(id: number) {
    return this.photoRepository.findOneBy({ id });
  }

  update(id: number, updatePhotoDto: UpdatePhotoDto) {
    return this.photoRepository.update(id, updatePhotoDto);
  }

  remove(id: number) {
    return this.photoRepository.delete(id);
  }
}

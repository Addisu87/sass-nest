import { Injectable, Logger } from '@nestjs/common';
import { Cat } from './schemas/cat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCatDto } from './dto/create-cat.dto';
import { Model } from 'mongoose';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    this.logger.log(`Creating a new cat: ${createCatDto.name}`);
    const createdCat = await this.catModel.create(createCatDto);
    this.logger.log(`Cat created with ID: ${String(createdCat._id)}`);
    return createdCat;
  }

  async findAll(): Promise<Cat[]> {
    this.logger.log('Finding all cats');
    return this.catModel.find().exec();
  }

  async findOne(id: string): Promise<Cat | null> {
    this.logger.log(`Finding cat with ID: ${id}`);
    return this.catModel.findById({ _id: id }).exec();
  }

  async update(id: string, updateCatDto: UpdateCatDto): Promise<Cat | null> {
    this.logger.log(`Updating cat with ID: ${id}`);
    return this.catModel
      .findByIdAndUpdate({ _id: id }, updateCatDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Cat | null> {
    this.logger.log(`Deleting cat with ID: ${id}`);
    const deletedCat = await this.catModel
      .findByIdAndDelete({ _id: id })
      .exec();
    this.logger.log(`Cat deleted with ID: ${id}`);
    return deletedCat;
  }
}

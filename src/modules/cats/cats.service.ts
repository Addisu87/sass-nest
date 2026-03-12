import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Cat } from './schemas/cat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCatDto } from './dto/create-cat.dto';
import { Model } from 'mongoose';
import { UpdateCatDto } from './dto/update-cat.dto';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(
    @InjectModel(Cat.name) private readonly catModel: Model<Cat>,
    @Optional() private readonly httpService?: HttpService,
  ) {}

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

  /**
   * Example of proper axios usage through Nest's HttpService.
   * Keep this separate from `findAll()` to avoid accidentally calling our own `/cats` endpoint.
   */
  async fetchCatsFromUrl(url: string): Promise<Cat[]> {
    if (!this.httpService) {
      throw new Error(
        'HttpService is not available. Did you import HttpModule?',
      );
    }

    const { data } = await firstValueFrom(
      this.httpService.get<Cat[]>(url).pipe(
        catchError((error: AxiosError) => {
          const status = error.response?.status;
          const responseData = error.response?.data;
          this.logger.error(
            `Failed to fetch cats from ${url}${status ? ` (status ${status})` : ''}: ${
              typeof responseData === 'string' ? responseData : error.message
            }`,
          );
          throw new HttpException(
            'Failed to fetch cats',
            HttpStatus.BAD_GATEWAY,
          );
        }),
      ),
    );

    return data;
  }

  async findOne(id: string): Promise<Cat | null> {
    this.logger.log(`Finding cat with ID: ${id}`);
    return this.catModel.findOne({ _id: id }).exec();
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

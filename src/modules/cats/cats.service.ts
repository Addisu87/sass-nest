import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './entities/cat.entity';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(
    @InjectRepository(Cat) private readonly catRepository: Repository<Cat>,
    @Optional() private readonly httpService?: HttpService,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    this.logger.log(`Creating a new cat: ${createCatDto.name}`);
    const cat = this.catRepository.create(createCatDto);
    const createdCat = await this.catRepository.save(cat);
    this.logger.log(`Cat created with ID: ${createdCat.id}`);
    return createdCat;
  }

  async findAll(): Promise<Cat[]> {
    this.logger.log('Finding all cats');
    return this.catRepository.find();
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
    return this.catRepository.findOne({ where: { id: Number(id) } });
  }

  async update(id: string, updateCatDto: UpdateCatDto): Promise<Cat | null> {
    this.logger.log(`Updating cat with ID: ${id}`);
    await this.catRepository.update(Number(id), updateCatDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<Cat | null> {
    this.logger.log(`Deleting cat with ID: ${id}`);
    const cat = await this.findOne(id);
    if (cat) {
      await this.catRepository.remove(cat);
    }
    this.logger.log(`Cat deleted with ID: ${id}`);
    return cat;
  }
}

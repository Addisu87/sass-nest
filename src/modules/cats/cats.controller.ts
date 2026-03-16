import {
  Controller,
  Get,
  Post,
  Body,
  UseFilters,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  UseInterceptors,
  Query,
  ParseBoolPipe,
  Session,
  Delete,
  Patch,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createCatSchema } from './cat-validation';
import { Roles } from '../../common/decorators/roles.decorator';
import { Cat } from './entities/cat.entity';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Role } from 'src/common/enum/role.enum';

@Controller('cats')
// @UseInterceptors(new LoggingInterceptor())
// @UseGuards(new RolesGuard())
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles(Role.Admin)
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ZodValidationPipe(createCatSchema))
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(@Session() session: Record<string, any>): Promise<Cat[]> {
    const visits = session.get('visits');
    session.set('visits', visits ? visits + 1 : 1);
    return await this.catsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @Query('sort', ParseBoolPipe) sort: boolean,
  ): Promise<Cat | null> {
    return this.catsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ): Promise<Cat | null> {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: string): Promise<Cat | null> {
    return this.catsService.delete(id);
  }
}

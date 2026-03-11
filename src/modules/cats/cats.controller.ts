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
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createCatSchema } from './cat-validation';
// import { RolesGuard } from './roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Cat } from './interfaces/cat.interface';
import { UpdateCatDto } from './dto/update-cat.dto';
// import { User } from '../../common/decorators/user.decorator';

@Controller('cats')
// @UseInterceptors(new LoggingInterceptor())
// @UseGuards(new RolesGuard())
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles('admin')
  // @Roles(['admin'])
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ZodValidationPipe(createCatSchema))
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return await this.catsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @Query('sort', ParseBoolPipe) sort: boolean,
  ): Promise<Cat | null> {
    return this.catsService.findOne(id);
  }

  @Post(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ): Promise<Cat | null> {
    return this.catsService.update(id, updateCatDto);
  }

  @Post(':id/delete')
  async delete(@Param('id', ParseIntPipe) id: string): Promise<Cat | null> {
    return this.catsService.delete(id);
  }
}

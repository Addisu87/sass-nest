import {
  Controller,
  Get,
  Inject,
  Injectable,
  Post,
  UploadedFile,
  UseInterceptors,
  PipeTransform,
  ArgumentMetadata,
  ParseFilePipe,
  Body,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipeBuilder,
  HttpStatus,
  UploadedFiles,
  Render,
  Sse,
  MessageEvent,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Cache, CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { SamplePhotoDto } from './modules/photo/dto/sample-photo.dto';
import { readFileSync } from 'node:fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}
  // constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // const value = await this.cacheManager.get('key')
  // await this.cacheManager.set('key', 'value', { ttl: 5000 });
  // await this.cacheManager.del('key');
  // await this.cacheManager.reset();
  // await this.cacheManager.clear();

  @Get()
  @Render('index.hbs')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('index')
  index(@Res() response: Response) {
    response
      .type('text/html')
      .send(readFileSync(join(__dirname, 'index.html')).toString());
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => ({ data: { hello: 'world' } }) as MessageEvent),
    );
  }

  @Get('list')
  async findAll() {
    // For demonstration purposes, we will simulate a delay
    // to show that the cache is working as expected.
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return [{ id: 1, name: 'Nest' }];
  }

  // Array of files
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  uploadFile(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    console.log(files);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  uploadSingleFile(
    @Body() body: SamplePhotoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      body,
      file: file?.buffer.toString(),
    };
  }

  // Single file
  @UseInterceptors(FileInterceptor('file'))
  @Post('file/pass-validation')
  uploadFileAndPassValidation(
    @Body() body: SamplePhotoDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      body,
      file: file?.buffer.toString(),
    };
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/fail-validation')
  uploadFileAndFailValidation(
    @Body() body: SamplePhotoDto,

    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .addMaxSizeValidator({
          maxSize: 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return {
      body,
      file: file.buffer.toString(),
    };
  }
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const oneKb = 1000; // 1 KB in bytes
    return value.size < oneKb;
  }
}

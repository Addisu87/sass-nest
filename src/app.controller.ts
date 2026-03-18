import {
  Controller,
  Get,
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
  Sse,
  MessageEvent,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { readFileSync } from 'node:fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreatePhotoDto } from './modules/photo/dto/create-photo.dto';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
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
  @UseInterceptors(CacheInterceptor)
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
    @Body() body: CreatePhotoDto,
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
    @Body() body: CreatePhotoDto,
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
    @Body() body: CreatePhotoDto,

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

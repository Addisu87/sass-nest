import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProd = process.env.NODE_ENV === 'production';
    const rawMessage =
      exception instanceof Error ? exception.message : String(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} (${rawMessage})`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      const payload =
        typeof responseBody === 'string' ? { message: responseBody } : responseBody;

      return response.status(status).json({
        statusCode: status,
        status: (HttpStatus as any)[status],
        ...(payload as object),
        ...(isProd ? {} : { error: rawMessage }),
      });
    }

    return response.status(status).json({
      statusCode: status,
      status: (HttpStatus as any)[status],
      message: 'Internal server error',
      ...(isProd ? {} : { error: rawMessage }),
    });
  }
}

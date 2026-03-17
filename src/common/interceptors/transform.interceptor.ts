import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode?: number;
  status?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const type = context.getType<'http' | 'ws' | 'rpc'>();
    if (type === 'http') {
      const res = context.switchToHttp().getResponse<{ statusCode?: number }>();
      return next.handle().pipe(
        map((data) => ({
          statusCode: res?.statusCode,
          status:
            typeof res?.statusCode === 'number'
              ? (HttpStatus as any)[res.statusCode]
              : undefined,
          data,
        })),
      );
    }

    return next.handle().pipe(map((data) => ({ data })));
  }
}

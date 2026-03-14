import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    const excludePaths: string[] = [
      // Routes to be excluded
    ];
    const requestUrl = httpAdapter.getRequestUrl?.(request) ?? '';
    if (
      !isGetRequest ||
      (isGetRequest && excludePaths.includes(requestUrl))
    ) {
      return undefined;
    }
    return requestUrl;
  }
}

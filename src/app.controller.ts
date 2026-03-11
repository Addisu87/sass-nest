import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Cache, CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';

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
  getHello(): string {
    return this.appService.getHello();
  }

  @Get()
  findAll() {
    // For demonstration purposes, we will simulate a delay
    // to show that the cache is working as expected.
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return [{ id: 1, name: 'Nest' }];
  }
}

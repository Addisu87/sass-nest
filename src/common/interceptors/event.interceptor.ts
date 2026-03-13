import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import { SubscribeMessage } from '@nestjs/websockets';

@UseInterceptors(new TransformInterceptor())
export class EventInterceptor {
  @SubscribeMessage('events')
  handleEvent(client: any, data: unknown): any {
    const event = 'events';
    return { event, data };
  }
}

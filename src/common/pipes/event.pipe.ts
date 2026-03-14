import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WsException } from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';

@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) => new WsException(errors),
  }),
)
export class EventPipe {
  @SubscribeMessage('events')
  handleEvent(client: unknown, data: unknown): WsResponse<unknown> {
    const event = 'events';
    return { event, data };
  }
}

import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WsException, WsResponse } from '@nestjs/websockets';

@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) => new WsException(errors),
  }),
)
export class EventPipe {
  @SubscribeMessage('events')
  handleEvent(client: ClientRequest, data: unknown): WsResponse<unknown> {
    const event = 'events';
    return { event, data };
  }
}

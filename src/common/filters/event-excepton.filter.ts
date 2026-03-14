import { ArgumentsHost, Catch, UseFilters } from '@nestjs/common';
import { BaseWsExceptionFilter, SubscribeMessage } from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';

@UseFilters(new BaseWsExceptionFilter())
export class EventExceptionFilter {
  @SubscribeMessage('events')
  OnEvent(client: unknown, data: unknown): WsResponse<unknown> {
    const event = 'events';
    return { event, data };
  }
}

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}

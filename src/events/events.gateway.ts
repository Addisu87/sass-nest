import {
  SubscribeMessage,
  MessageBody,
  WsResponse,
  WebSocketServer,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map(
        (item: number): WsResponse<number> => ({ event: 'events', data: item }),
      ),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    // Artificial await to satisfy linter warning
    return await Promise.resolve(data);
  }
}

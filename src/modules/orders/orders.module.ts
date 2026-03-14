import { Module } from '@nestjs/common';
import { OrderCreatedListener } from './listenters/order-created.listener';
import { OrdersController } from './orders.controller';
import { OrdersService } from './order.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderCreatedListener],
})
export class OrdersModule {}

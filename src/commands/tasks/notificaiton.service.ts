import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @Cron('* * 8 * * *', {
    name: 'notifications',
    timeZone: 'Africa/Addis Ababa',
  })
  triggerNotifications() {
    console.log('Triggering notifications');
  }

  @Interval('notifications', 2500)
  handleInterval() {
    console.log('Handling notification interval');
  }

  @Timeout('notifications', 2500)
  handleTimeout() {
    console.log('Handling notification timeout');
  }
}

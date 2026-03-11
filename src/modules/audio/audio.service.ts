import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private readonly audioQueue: Queue) {}

  async processAudio(filePath: string) {
    await this.audioQueue.add('transcode', { filePath }, { delay: 3000 });
  }
}

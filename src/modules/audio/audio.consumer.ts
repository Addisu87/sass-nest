import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}....`,
    );
  }
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'transcode': {
        let progress = 0;
        for (let i = 0; i < 100; i++) {
          await this.processJobData(job.data);
          progress += 1;
          await job.updateProgress(progress);
        }
        return {};
      }
      case 'concatenate': {
        await this.doSomething();
        break;
      }
    }
  }

  private async processJobData(_data: unknown): Promise<void> {
    // Process job data
  }

  private async doSomething(): Promise<void> {
    // Placeholder logic
  }
}

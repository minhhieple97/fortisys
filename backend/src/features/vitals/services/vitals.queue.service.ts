import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { VitalsRepository } from '../repositories/vitals.repository';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import {
  QUEUE_VITAL_NAME,
  BULLMQ_DEFAULT_REMOVE_ON_COMPLETE,
  BULLMQ_DEFAULT_REMOVE_ON_FAIL,
} from '../../../constants';

export interface VitalRecordJobData {
  createVitalsDto: CreateVitalsDto;
}

@Injectable()
export class VitalsQueueService {
  constructor(
    @InjectQueue(QUEUE_VITAL_NAME)
    private readonly vitalRecordsQueue: Queue,
    private readonly vitalsRepository: VitalsRepository,
  ) {}

  async addVitalRecordJob(createVitalsDto: CreateVitalsDto): Promise<Job> {
    const jobData: VitalRecordJobData = {
      createVitalsDto,
    };

    return await this.vitalRecordsQueue.add('vital-record', jobData, {
      priority: 1,
      removeOnComplete: BULLMQ_DEFAULT_REMOVE_ON_COMPLETE,
      removeOnFail: BULLMQ_DEFAULT_REMOVE_ON_FAIL,
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.vitalRecordsQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = await job.progress;
    const result = await job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      name: job.name,
      status: state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async getQueueStats(): Promise<any> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.vitalRecordsQueue.getWaiting(),
      this.vitalRecordsQueue.getActive(),
      this.vitalRecordsQueue.getCompleted(),
      this.vitalRecordsQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  async clearQueue(): Promise<void> {
    await this.vitalRecordsQueue.clean(0, 0, 'completed');
    await this.vitalRecordsQueue.clean(0, 0, 'failed');
  }

  async pauseQueue(): Promise<void> {
    await this.vitalRecordsQueue.pause();
  }

  async resumeQueue(): Promise<void> {
    await this.vitalRecordsQueue.resume();
  }
}

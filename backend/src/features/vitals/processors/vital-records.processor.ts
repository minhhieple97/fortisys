import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VitalsRepository } from '../repositories/vitals.repository';
import { VitalsCacheService } from '../services/vitals.cache.service';
import { VitalRecordJobData } from '../services/vitals.queue.service';
import { QUEUE_VITAL_NAME } from 'src/constants';

@Processor(QUEUE_VITAL_NAME)
export class VitalRecordsProcessor extends WorkerHost {
  private readonly logger = new Logger(VitalRecordsProcessor.name);

  constructor(
    private readonly vitalsRepository: VitalsRepository,
    private readonly vitalsCacheService: VitalsCacheService,
  ) {
    super();
  }

  async process(job: Job<VitalRecordJobData>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      return await this.processVitalRecord(job);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processVitalRecord(job: Job<VitalRecordJobData>): Promise<any> {
    const { createVitalsDto } = job.data;

    this.logger.log(
      `Processing vital record creation for worker ${createVitalsDto.workerId}`,
    );

    try {
      const createdVital = await this.vitalsRepository.create(createVitalsDto);

      await this.vitalsCacheService.addWorkerVital(
        createdVital.workerId,
        createdVital,
      );

      this.logger.log(
        `Successfully processed vital record creation ${createdVital.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process vital record creation: ${error.message}`,
      );
      throw error;
    }
  }

  async onCompleted(job: Job): Promise<void> {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  async onFailed(job: Job, err: Error): Promise<void> {
    this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
  }

  async onProgress(job: Job, progress: number): Promise<void> {
    this.logger.log(`Job ${job.id} progress: ${progress}%`);
  }
}

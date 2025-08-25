import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import { VitalsRepository } from '../repositories/vitals.repository';
import { VitalsQueueService } from './vitals.queue.service';
import { VitalsCacheService } from './vitals.cache.service';
import {
  VITALS_DEFAULT_LIMIT,
  VITALS_DEFAULT_OFFSET,
  ERROR_MESSAGES,
} from '../../../constants';

@Injectable()
export class VitalsService {
  private readonly logger = new Logger(VitalsService.name);
  constructor(
    private readonly vitalsRepository: VitalsRepository,
    private readonly vitalsQueueService: VitalsQueueService,
    private readonly vitalsCacheService: VitalsCacheService,
  ) {}

  async create(createVitalsDto: CreateVitalsDto) {
    try {
      await this.vitalsQueueService.addVitalRecordJob(createVitalsDto);
      return {
        workerId: createVitalsDto.workerId,
      };
    } catch (error) {
      this.logger.warn(ERROR_MESSAGES.QUEUE_JOB_FAILED, error.message);
      throw new InternalServerErrorException(ERROR_MESSAGES.QUEUE_JOB_FAILED);
    }
  }

  async getRecentVitals(workerId: string): Promise<VitalsEntity[]> {
    try {
      const cachedVitals =
        await this.vitalsCacheService.getWorkerVitals(workerId);
      if (cachedVitals) {
        return cachedVitals;
      }
    } catch (error) {
      this.logger.warn('Cache service error:', error.message);
    }

    const vitals = await this.vitalsRepository.findVitalsByWorkerId(
      workerId,
      VITALS_DEFAULT_LIMIT,
      VITALS_DEFAULT_OFFSET,
    );

    try {
      await this.vitalsCacheService.setWorkerVitals(workerId, vitals);
    } catch (error) {
      this.logger.warn('Failed to update cache:', error.message);
    }

    return vitals;
  }
}

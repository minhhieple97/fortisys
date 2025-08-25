import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../prisma/prisma.module';
import { VitalsController } from './controllers/vitals.controller';
import { VitalsService } from './services/vitals.service';
import { VitalsRepository } from './repositories/vitals.repository';
import { VitalsCacheService } from './services/vitals.cache.service';
import { VitalsQueueService } from './services/vitals.queue.service';
import { VitalRecordsProcessor } from './processors/vital-records.processor';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import {
  QUEUE_VITAL_NAME,
  BULLMQ_DEFAULT_ATTEMPTS,
  BULLMQ_DEFAULT_BACKOFF_DELAY,
  BULLMQ_DEFAULT_REMOVE_ON_COMPLETE,
  BULLMQ_DEFAULT_REMOVE_ON_FAIL,
} from 'src/constants';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: QUEUE_VITAL_NAME,
      defaultJobOptions: {
        attempts: BULLMQ_DEFAULT_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: BULLMQ_DEFAULT_BACKOFF_DELAY,
        },
        removeOnComplete: BULLMQ_DEFAULT_REMOVE_ON_COMPLETE,
        removeOnFail: BULLMQ_DEFAULT_REMOVE_ON_FAIL,
      },
    }),
    RedisModule,
  ],
  controllers: [VitalsController],
  providers: [
    VitalsService,
    VitalsRepository,
    VitalsQueueService,
    VitalsCacheService,
    VitalRecordsProcessor,
    RedisService,
  ],
  exports: [
    VitalsService,
    VitalsRepository,
    VitalsQueueService,
    VitalsCacheService,
  ],
})
export class VitalsModule {}

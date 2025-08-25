import { Injectable, Logger } from '@nestjs/common';
import { VitalsEntity } from '../entities/vitals.entity';
import { RedisService } from '../../../redis/redis.service';
import {
  VITALS_MAX_PER_WORKER,
  VITALS_DEFAULT_LIMIT,
  VITALS_DEFAULT_OFFSET,
  CACHE_KEY_PREFIX,
  CACHE_KEY_SUFFIX,
  CACHE_HIT_COUNT_FIELD,
} from '../../../constants';

@Injectable()
export class VitalsCacheService {
  private readonly logger = new Logger(VitalsCacheService.name);
  private readonly MAX_VITALS_PER_WORKER = VITALS_MAX_PER_WORKER;

  constructor(private readonly redisService: RedisService) {}

  async addWorkerVital(workerId: string, vital: VitalsEntity): Promise<void> {
    try {
      const vitalsKey = this.buildWorkerVitalsKey(workerId);
      const timestamp = new Date(vital.timestamp).getTime();
      const vitalData = JSON.stringify(vital);

      const transaction = this.redisService.multi();

      transaction.zadd(vitalsKey, timestamp, vitalData);

      transaction.zremrangebyrank(
        vitalsKey,
        0,
        -(this.MAX_VITALS_PER_WORKER + 1),
      );

      await transaction.exec();
    } catch (error) {
      this.logger.warn(
        `Failed to add vital to cache for worker ${workerId}`,
        error.message,
      );
    }
  }

  async getWorkerVitals(
    workerId: string,
    limit: number = VITALS_DEFAULT_LIMIT,
    offset: number = VITALS_DEFAULT_OFFSET,
  ): Promise<VitalsEntity[] | null> {
    try {
      const key = this.buildWorkerVitalsKey(workerId);
      const start = offset;
      const stop = offset + limit - 1;

      const results = await this.redisService.zrevrange(key, start, stop);

      if (!results || results.length === 0) {
        return null;
      }

      await this.incrementCacheHit(workerId);

      return results.map((result) => JSON.parse(result));
    } catch (error) {
      this.logger.warn(`Cache get error for worker ${workerId}`, error.message);
      return null;
    }
  }

  async setWorkerVitals(
    workerId: string,
    vitals: VitalsEntity[],
  ): Promise<void> {
    try {
      if (!vitals || vitals.length === 0) return;

      const vitalsKey = this.buildWorkerVitalsKey(workerId);

      const membersToAdd = vitals.flatMap((vital) => [
        new Date(vital.timestamp).getTime(),
        JSON.stringify(vital),
      ]);

      const transaction = this.redisService.multi();

      transaction.del(vitalsKey);

      transaction.zadd(vitalsKey, ...membersToAdd);

      transaction.zremrangebyrank(
        vitalsKey,
        0,
        -(this.MAX_VITALS_PER_WORKER + 1),
      );

      await transaction.exec();
    } catch (error) {
      this.logger.warn(`Cache set error for worker ${workerId}`, error.message);
    }
  }

  private async incrementCacheHit(workerId: string): Promise<void> {
    try {
      await this.redisService.hincrby(workerId, CACHE_HIT_COUNT_FIELD, 1);
    } catch (error) {
      this.logger.warn(
        `Cache hit increment error for worker ${workerId}`,
        error.message,
      );
    }
  }

  private buildWorkerVitalsKey = (workerId: string): string =>
    `${CACHE_KEY_PREFIX}:${workerId}:${CACHE_KEY_SUFFIX}`;
}

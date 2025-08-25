import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis, { RedisKey } from 'ioredis';
import { REDIS_CLIENT } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  onModuleDestroy() {
    this.redisClient.quit();
    this.logger.log('Redis client connection closed.');
  }

  async get(key: RedisKey): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(
    key: RedisKey,
    value: string | Buffer | number,
    ttlInSeconds?: number,
  ): Promise<'OK'> {
    if (ttlInSeconds) {
      return this.redisClient.set(key, value, 'EX', ttlInSeconds);
    }
    return this.redisClient.set(key, value);
  }

  async del(...keys: RedisKey[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.redisClient.del(...keys);
  }

  async zadd(
    key: RedisKey,
    ...scoreMembers: (string | number)[]
  ): Promise<number> {
    return this.redisClient.zadd(key, ...scoreMembers);
  }

  async zremrangebyrank(
    key: RedisKey,
    start: number,
    stop: number,
  ): Promise<number> {
    return this.redisClient.zremrangebyrank(key, start, stop);
  }

  async zrevrange(
    key: RedisKey,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return this.redisClient.zrevrange(key, start, stop);
  }

  async zcard(key: RedisKey): Promise<number> {
    return this.redisClient.zcard(key);
  }

  async hset(key: RedisKey, value: Record<string, any>): Promise<number> {
    return this.redisClient.hset(key, value);
  }

  async hgetall(key: RedisKey): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  async hincrby(
    key: RedisKey,
    field: string,
    increment: number,
  ): Promise<number> {
    return this.redisClient.hincrby(key, field, increment);
  }

  multi() {
    return this.redisClient.multi();
  }

  async expire(key: RedisKey, seconds: number): Promise<number> {
    return this.redisClient.expire(key, seconds);
  }
}

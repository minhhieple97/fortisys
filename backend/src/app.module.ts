import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { VitalsModule } from './features/vitals/vitals.module';
import { RedisModule } from './redis/redis.module';
import {
  REDIS_DEFAULT_HOST,
  REDIS_DEFAULT_PORT,
  REDIS_RETRY_DELAY_ON_FAILOVER,
  REDIS_MAX_LOADING_TIMEOUT,
  BULLMQ_DEFAULT_ATTEMPTS,
  BULLMQ_DEFAULT_BACKOFF_DELAY,
  BULLMQ_DEFAULT_REMOVE_ON_COMPLETE,
  BULLMQ_DEFAULT_REMOVE_ON_FAIL,
} from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', REDIS_DEFAULT_HOST),
          port: configService.get<number>('REDIS_PORT', REDIS_DEFAULT_PORT),
          password: configService.get<string>('REDIS_PASSWORD'),
          retryDelayOnFailover: REDIS_RETRY_DELAY_ON_FAILOVER,
          enableReadyCheck: true,
          maxLoadingTimeout: REDIS_MAX_LOADING_TIMEOUT,
        },
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
    }),
    PrismaModule,
    VitalsModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

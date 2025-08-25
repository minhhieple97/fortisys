import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import {
  VITALS_DEFAULT_LIMIT,
  VITALS_DEFAULT_OFFSET,
} from '../../../constants';

@Injectable()
export class VitalsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVitalsDto: CreateVitalsDto): Promise<VitalsEntity> {
    const prismaResult = await this.prismaService.write.vitalRecord.create({
      data: {
        workerId: createVitalsDto.workerId,
        heartRate: createVitalsDto.heartRate,
        temperature: createVitalsDto.temperature,
      },
    });

    return prismaResult;
  }

  async findVitalsByWorkerId(
    workerId: string,
    limit: number = VITALS_DEFAULT_LIMIT,
    offset: number = VITALS_DEFAULT_OFFSET,
  ): Promise<VitalsEntity[]> {
    const prismaResults = await this.prismaService.read.vitalRecord.findMany({
      where: { workerId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return prismaResults;
  }

  async findByWorkerIdAndTimeRange(
    workerId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<VitalsEntity[]> {
    const prismaResults = await this.prismaService.read.vitalRecord.findMany({
      where: {
        workerId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return prismaResults;
  }
}

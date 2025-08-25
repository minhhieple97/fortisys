import { ApiProperty } from '@nestjs/swagger';
import { VitalsEntity } from '../entities/vitals.entity';
import { VITALS_DEFAULT_LIMIT, API_EXAMPLES } from '../../../constants';

export class VitalsResponseDto {
  @ApiProperty({
    description: 'Array of vital records',
    type: [VitalsEntity],
    example: [
      {
        id: API_EXAMPLES.UUID,
        workerId: API_EXAMPLES.WORKER_ID,
        heartRate: API_EXAMPLES.HEART_RATE,
        temperature: API_EXAMPLES.TEMPERATURE,
        timestamp: API_EXAMPLES.TIMESTAMP,
      },
    ],
  })
  data: VitalsEntity[];

  @ApiProperty({
    description: 'Total count of records',
    example: 1,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (for pagination)',
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: VITALS_DEFAULT_LIMIT,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: API_EXAMPLES.TIMESTAMP,
    type: String,
  })
  timestamp: string;
}

export class VitalsBulkResponseDto {
  @ApiProperty({
    description: 'Number of records successfully processed',
    example: VITALS_DEFAULT_LIMIT * 10,
    type: Number,
  })
  processedCount: number;

  @ApiProperty({
    description: 'Number of records that failed to process',
    example: 0,
    type: Number,
  })
  failedCount: number;

  @ApiProperty({
    description: 'Total number of records in the batch',
    example: VITALS_DEFAULT_LIMIT * 10,
    type: Number,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Array of processing results',
    type: Array,
    example: [
      {
        id: API_EXAMPLES.UUID,
        workerId: API_EXAMPLES.WORKER_ID,
        status: 'success',
        timestamp: API_EXAMPLES.TIMESTAMP,
      },
    ],
  })
  results: any[];

  @ApiProperty({
    description: 'Timestamp of the response',
    example: API_EXAMPLES.TIMESTAMP,
    type: String,
  })
  timestamp: string;
}

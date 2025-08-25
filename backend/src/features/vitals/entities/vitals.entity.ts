import { ApiProperty } from '@nestjs/swagger';
import { API_EXAMPLES } from '../../../constants';

export class VitalsEntity {
  @ApiProperty({
    description: 'Unique identifier for the vital record',
    example: API_EXAMPLES.UUID,
  })
  id: string;

  @ApiProperty({
    description: 'Worker ID',
    example: API_EXAMPLES.WORKER_ID,
  })
  workerId: string;

  @ApiProperty({
    description: 'Heart rate in beats per minute',
    example: API_EXAMPLES.HEART_RATE,
  })
  heartRate: number;

  @ApiProperty({
    description: 'Body temperature in Celsius',
    example: API_EXAMPLES.TEMPERATURE,
  })
  temperature: number;

  @ApiProperty({
    description: 'Timestamp when the vital record was created',
    example: API_EXAMPLES.TIMESTAMP,
  })
  timestamp: Date;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { API_EXAMPLES } from '../../../constants';

export class WorkerIdDto {
  @ApiProperty({
    description: 'The ID of the worker',
    example: API_EXAMPLES.WORKER_ID,
  })
  @IsString()
  @IsNotEmpty()
  workerId: string;
}

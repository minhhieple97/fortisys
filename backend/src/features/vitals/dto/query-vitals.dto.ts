import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  WORKER_ID_MIN_LENGTH,
  WORKER_ID_MAX_LENGTH,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MAX_LIMIT_EXTENDED,
  PAGINATION_MIN_OFFSET,
  VITALS_DEFAULT_LIMIT,
  VITALS_DEFAULT_OFFSET,
  ERROR_MESSAGES,
  API_EXAMPLES,
} from '../../../constants';

export class QueryVitalsDto {
  @ApiProperty({
    description: 'Worker ID to query vitals for',
    example: API_EXAMPLES.WORKER_ID,
    minLength: WORKER_ID_MIN_LENGTH,
    maxLength: WORKER_ID_MAX_LENGTH,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.WORKER_ID_REQUIRED })
  @IsString({ message: ERROR_MESSAGES.WORKER_ID_MUST_BE_STRING })
  @Transform(({ value }) => value?.trim())
  workerId: string;

  @ApiProperty({
    description: 'Start time for the query range (ISO date string)',
    example: API_EXAMPLES.START_TIME,
    type: String,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.START_TIME_REQUIRED })
  @IsDateString({}, { message: ERROR_MESSAGES.TIMESTAMP_INVALID })
  startTime: string;

  @ApiProperty({
    description: 'End time for the query range (ISO date string)',
    example: API_EXAMPLES.END_TIME,
    type: String,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.END_TIME_REQUIRED })
  @IsDateString({}, { message: ERROR_MESSAGES.TIMESTAMP_INVALID })
  endTime: string;

  @ApiProperty({
    description: `Maximum number of records to return (default: ${VITALS_DEFAULT_LIMIT * 10}, max: ${PAGINATION_MAX_LIMIT_EXTENDED})`,
    example: VITALS_DEFAULT_LIMIT * 10,
    required: false,
    minimum: PAGINATION_MIN_LIMIT,
    maximum: PAGINATION_MAX_LIMIT_EXTENDED,
    default: VITALS_DEFAULT_LIMIT * 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ERROR_MESSAGES.LIMIT_MUST_BE_INTEGER })
  @Min(PAGINATION_MIN_LIMIT, { message: ERROR_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_MAX_LIMIT_EXTENDED, {
    message: ERROR_MESSAGES.LIMIT_MAX_EXTENDED,
  })
  @Transform(({ value }) =>
    value ? parseInt(value, 10) : VITALS_DEFAULT_LIMIT * 10,
  )
  limit?: number;

  @ApiProperty({
    description: 'Offset for pagination (default: 0)',
    example: VITALS_DEFAULT_OFFSET,
    required: false,
    minimum: PAGINATION_MIN_OFFSET,
    default: VITALS_DEFAULT_OFFSET,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ERROR_MESSAGES.OFFSET_MUST_BE_INTEGER })
  @Min(PAGINATION_MIN_OFFSET, { message: ERROR_MESSAGES.OFFSET_MIN })
  @Transform(({ value }) =>
    value ? parseInt(value, 10) : VITALS_DEFAULT_OFFSET,
  )
  offset?: number;
}

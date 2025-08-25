import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Max,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  WORKER_ID_MIN_LENGTH,
  WORKER_ID_MAX_LENGTH,
  HEART_RATE_MIN,
  HEART_RATE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
  DECIMAL_PRECISION,
  ERROR_MESSAGES,
  API_EXAMPLES,
} from '../../../constants';

export class CreateVitalsDto {
  @ApiProperty({
    description: 'Worker ID - must be a valid identifier',
    example: API_EXAMPLES.WORKER_ID,
    minLength: WORKER_ID_MIN_LENGTH,
    maxLength: WORKER_ID_MAX_LENGTH,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.WORKER_ID_REQUIRED })
  @IsString({ message: ERROR_MESSAGES.WORKER_ID_MUST_BE_STRING })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: ERROR_MESSAGES.WORKER_ID_INVALID_FORMAT,
  })
  @Transform(({ value }) => value?.trim())
  workerId: string;

  @ApiProperty({
    description: 'Heart rate in beats per minute',
    minimum: HEART_RATE_MIN,
    maximum: HEART_RATE_MAX,
    example: API_EXAMPLES.HEART_RATE,
    type: Number,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.HEART_RATE_REQUIRED })
  @Type(() => Number)
  @IsNumber({}, { message: ERROR_MESSAGES.HEART_RATE_MUST_BE_NUMBER })
  @Min(HEART_RATE_MIN, { message: ERROR_MESSAGES.HEART_RATE_MIN })
  @Max(HEART_RATE_MAX, { message: ERROR_MESSAGES.HEART_RATE_MAX })
  @Transform(
    ({ value }) =>
      Math.round(Number(value) * DECIMAL_PRECISION) / DECIMAL_PRECISION,
  ) // Round to 2 decimal places
  heartRate: number;

  @ApiProperty({
    description: 'Body temperature in Celsius',
    minimum: TEMPERATURE_MIN,
    maximum: TEMPERATURE_MAX,
    example: API_EXAMPLES.TEMPERATURE,
    type: Number,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.TEMPERATURE_REQUIRED })
  @Type(() => Number)
  @IsNumber({}, { message: ERROR_MESSAGES.TEMPERATURE_MUST_BE_NUMBER })
  @Min(TEMPERATURE_MIN, { message: ERROR_MESSAGES.TEMPERATURE_MIN })
  @Max(TEMPERATURE_MAX, { message: ERROR_MESSAGES.TEMPERATURE_MAX })
  @Transform(
    ({ value }) =>
      Math.round(Number(value) * DECIMAL_PRECISION) / DECIMAL_PRECISION,
  ) // Round to 2 decimal places
  temperature: number;

  @ApiProperty({
    description:
      'Optional timestamp for the vital record (defaults to current time)',
    example: API_EXAMPLES.TIMESTAMP,
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: ERROR_MESSAGES.TIMESTAMP_INVALID })
  timestamp?: string;
}

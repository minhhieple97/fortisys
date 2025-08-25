import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  PAGINATION_MIN_LIMIT,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_OFFSET,
  VITALS_DEFAULT_LIMIT,
  VITALS_DEFAULT_OFFSET,
  ERROR_MESSAGES,
} from '../../../constants';

export class FindVitalsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of records to return',
    minimum: PAGINATION_MIN_LIMIT,
    maximum: PAGINATION_MAX_LIMIT,
    default: VITALS_DEFAULT_LIMIT,
    example: VITALS_DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ERROR_MESSAGES.LIMIT_MUST_BE_INTEGER })
  @Min(PAGINATION_MIN_LIMIT, { message: ERROR_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_MAX_LIMIT, { message: ERROR_MESSAGES.LIMIT_MAX })
  @Transform(({ value }) =>
    value === undefined ? VITALS_DEFAULT_LIMIT : value,
  )
  limit?: number = VITALS_DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    minimum: PAGINATION_MIN_OFFSET,
    default: VITALS_DEFAULT_OFFSET,
    example: VITALS_DEFAULT_OFFSET,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ERROR_MESSAGES.OFFSET_MUST_BE_INTEGER })
  @Min(PAGINATION_MIN_OFFSET, { message: ERROR_MESSAGES.OFFSET_MIN })
  @Transform(({ value }) =>
    value === undefined ? VITALS_DEFAULT_OFFSET : value,
  )
  offset?: number = VITALS_DEFAULT_OFFSET;
}

import { Controller, Post, Get, Body, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VitalsService } from '../services/vitals.service';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { WorkerIdDto } from '../dto/worker-id.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import { VITALS_DEFAULT_LIMIT, API_EXAMPLES } from '../../../constants';

@ApiTags('vitals')
@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vital record' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'The vital record creation job has been queued successfully.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  async create(@Body() createVitalsDto: CreateVitalsDto) {
    return this.vitalsService.create(createVitalsDto);
  }

  @Get(':workerId/recent')
  @ApiOperation({
    summary: `Get ${VITALS_DEFAULT_LIMIT} most recent vital records for a worker`,
  })
  @ApiParam({
    name: 'workerId',
    description: 'The ID of the worker',
    example: API_EXAMPLES.WORKER_ID,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: `Returns ${VITALS_DEFAULT_LIMIT} most recent vital records for the worker.`,
    type: [VitalsEntity],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Worker not found.',
  })
  async getRecentVitals(@Param() params: WorkerIdDto): Promise<VitalsEntity[]> {
    return this.vitalsService.getRecentVitals(params.workerId);
  }
}

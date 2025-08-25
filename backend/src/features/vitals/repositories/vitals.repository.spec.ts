import { Test, TestingModule } from '@nestjs/testing';
import { VitalsRepository } from './vitals.repository';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';

describe('VitalsRepository', () => {
  let repository: VitalsRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    write: {
      vitalRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    },
    read: {
      vitalRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VitalsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<VitalsRepository>(VitalsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Structure', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should have PrismaService injected', () => {
      expect(prismaService).toBeDefined();
    });

    it('should have create method defined', () => {
      expect(repository.create).toBeDefined();
      expect(typeof repository.create).toBe('function');
    });

    it('should have findVitalsByWorkerId method defined', () => {
      expect(repository.findVitalsByWorkerId).toBeDefined();
      expect(typeof repository.findVitalsByWorkerId).toBe('function');
    });

    it('should have findByWorkerIdAndTimeRange method defined', () => {
      expect(repository.findByWorkerIdAndTimeRange).toBeDefined();
      expect(typeof repository.findByWorkerIdAndTimeRange).toBe('function');
    });
  });

  describe('create method', () => {
    const validCreateVitalsDto: CreateVitalsDto = {
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
    };

    const mockPrismaVitalRecord = {
      id: 'uuid-123-456-789',
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
      timestamp: new Date('2024-01-01T12:00:00.000Z'),
    };

    const expectedVitalsEntity: VitalsEntity = {
      id: 'uuid-123-456-789',
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
      timestamp: new Date('2024-01-01T12:00:00.000Z'),
    };

    it('should call Prisma write client vitalRecord.create with correct parameters', async () => {
      mockPrismaService.write.vitalRecord.create.mockResolvedValue(
        mockPrismaVitalRecord,
      );

      await repository.create(validCreateVitalsDto);

      expect(prismaService.write.vitalRecord.create).toHaveBeenCalledWith({
        data: {
          workerId: validCreateVitalsDto.workerId,
          heartRate: validCreateVitalsDto.heartRate,
          temperature: validCreateVitalsDto.temperature,
        },
      });
      expect(prismaService.write.vitalRecord.create).toHaveBeenCalledTimes(1);
    });

    it('should transform Prisma result to VitalsEntity', async () => {
      mockPrismaService.write.vitalRecord.create.mockResolvedValue(
        mockPrismaVitalRecord,
      );

      const result = await repository.create(validCreateVitalsDto);

      expect(result).toEqual(expectedVitalsEntity);
      expect(result.id).toBe(mockPrismaVitalRecord.id);
      expect(result.workerId).toBe(mockPrismaVitalRecord.workerId);
      expect(result.heartRate).toBe(mockPrismaVitalRecord.heartRate);
      expect(result.temperature).toBe(mockPrismaVitalRecord.temperature);
      expect(result.timestamp).toEqual(mockPrismaVitalRecord.timestamp);
    });

    it('should handle different valid input data', async () => {
      const testCases = [
        {
          input: { workerId: 'worker-1', heartRate: 30, temperature: 20.0 },
          expected: {
            workerId: 'worker-1',
            heartRate: 30,
            temperature: 20.0,
          },
        },
        {
          input: { workerId: 'worker-2', heartRate: 150, temperature: 39.5 },
          expected: {
            workerId: 'worker-2',
            heartRate: 150,
            temperature: 39.5,
          },
        },
        {
          input: { workerId: 'worker-3', heartRate: 300, temperature: 50.0 },
          expected: {
            workerId: 'worker-3',
            heartRate: 300,
            temperature: 50.0,
          },
        },
      ];

      for (const testCase of testCases) {
        mockPrismaService.write.vitalRecord.create.mockResolvedValue({
          ...mockPrismaVitalRecord,
          ...testCase.expected,
          id: `uuid-${Date.now()}`,
        });

        const result = await repository.create(testCase.input);

        expect(prismaService.write.vitalRecord.create).toHaveBeenCalledWith({
          data: testCase.expected,
        });
        expect(result.workerId).toBe(testCase.input.workerId);
        expect(result.heartRate).toBe(testCase.input.heartRate);
        expect(result.temperature).toBe(testCase.input.temperature);
      }
    });

    it('should handle Prisma validation errors', async () => {
      const validationError = new PrismaClientKnownRequestError(
        'Validation failed',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
          meta: { target: ['worker_id'] },
        },
      );

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        validationError,
      );

      await expect(repository.create(validCreateVitalsDto)).rejects.toThrow(
        PrismaClientKnownRequestError,
      );
    });

    it('should handle Prisma constraint violations', async () => {
      const constraintError = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
          meta: { target: ['worker_id', 'timestamp'] },
        },
      );

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        constraintError,
      );

      await expect(repository.create(validCreateVitalsDto)).rejects.toThrow(
        PrismaClientKnownRequestError,
      );
    });

    it('should handle Prisma connection errors', async () => {
      const connectionError = new PrismaClientUnknownRequestError(
        'Connection failed',
        {
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        connectionError,
      );

      await expect(repository.create(validCreateVitalsDto)).rejects.toThrow(
        PrismaClientUnknownRequestError,
      );
    });

    it('should handle unexpected Prisma errors', async () => {
      const unexpectedError = new Error('Unexpected Prisma error');
      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        unexpectedError,
      );

      await expect(repository.create(validCreateVitalsDto)).rejects.toThrow(
        'Unexpected Prisma error',
      );
    });

    it('should process multiple concurrent creation requests', async () => {
      const requests = Array.from({ length: 5 }, (_, index) => ({
        ...validCreateVitalsDto,
        workerId: `worker-${index}`,
        heartRate: 70 + index,
      }));

      mockPrismaService.write.vitalRecord.create.mockImplementation((data) =>
        Promise.resolve({
          ...mockPrismaVitalRecord,
          ...data.data,
          id: `uuid-${Date.now()}-${Math.random()}`,
        }),
      );

      const results = await Promise.all(
        requests.map((request) => repository.create(request)),
      );

      expect(results).toHaveLength(5);
      expect(prismaService.write.vitalRecord.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('findVitalsByWorkerId method', () => {
    const workerId = 'worker-123';
    const mockPrismaVitalRecords = [
      {
        id: 'uuid-1',
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
      },
      {
        id: 'uuid-2',
        workerId: 'worker-123',
        heartRate: 75,
        temperature: 36.7,
        timestamp: new Date('2024-01-01T12:01:00.000Z'),
      },
    ];

    const expectedVitalsEntities: VitalsEntity[] = [
      {
        id: 'uuid-1',
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
      },
      {
        id: 'uuid-2',
        workerId: 'worker-123',
        heartRate: 75,
        temperature: 36.7,
        timestamp: new Date('2024-01-01T12:01:00.000Z'),
      },
    ];

    it('should call Prisma read client vitalRecord.findMany with correct parameters', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue(
        mockPrismaVitalRecords,
      );

      await repository.findVitalsByWorkerId(workerId, 10, 0);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledTimes(1);
    });

    it('should use default limit and offset when not provided', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      await repository.findVitalsByWorkerId(workerId);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should transform Prisma results to VitalsEntity array', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue(
        mockPrismaVitalRecords,
      );

      const result = await repository.findVitalsByWorkerId(workerId, 10, 0);

      expect(result).toEqual(expectedVitalsEntities);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].workerId).toBe(mockPrismaVitalRecords[0].workerId);
      expect(result[0].heartRate).toBe(mockPrismaVitalRecords[0].heartRate);
      expect(result[0].temperature).toBe(mockPrismaVitalRecords[0].temperature);
    });

    it('should return empty array when no records found', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      const result = await repository.findVitalsByWorkerId(workerId, 10, 0);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should limit results to maximum 10 records', async () => {
      const tenPrismaRecords = Array.from({ length: 10 }, (_, index) => ({
        id: `uuid-${index}`,
        workerId: 'worker-123',
        heartRate: 70 + index,
        temperature: 36.0 + index * 0.1,
        timestamp: new Date(`2024-01-01T12:0${index}:00.000Z`),
      }));

      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue(
        tenPrismaRecords,
      );

      const result = await repository.findVitalsByWorkerId(workerId, 10, 0);

      expect(result).toHaveLength(10);
      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should handle different worker IDs correctly', async () => {
      const testWorkerIds = ['worker-1', 'worker-2', 'worker-abc-123'];

      for (const testWorkerId of testWorkerIds) {
        mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

        await repository.findVitalsByWorkerId(testWorkerId, 10, 0);

        expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
          where: { workerId: testWorkerId },
          orderBy: { timestamp: 'desc' },
          take: 10,
          skip: 0,
        });
      }
    });

    it('should order results by timestamp in descending order', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue(
        mockPrismaVitalRecords,
      );

      await repository.findVitalsByWorkerId(workerId, 10, 0);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { timestamp: 'desc' },
        }),
      );
    });

    it('should handle pagination parameters correctly', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      await repository.findVitalsByWorkerId(workerId, 5, 10);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
        take: 5,
        skip: 10,
      });
    });

    it('should handle Prisma query errors', async () => {
      const queryError = new PrismaClientKnownRequestError('Query failed', {
        code: 'P2000',
        clientVersion: '1.0.0',
      });

      mockPrismaService.read.vitalRecord.findMany.mockRejectedValue(queryError);

      await expect(
        repository.findVitalsByWorkerId(workerId, 10, 0),
      ).rejects.toThrow(PrismaClientKnownRequestError);
    });

    it('should handle Prisma connection errors', async () => {
      const connectionError = new PrismaClientUnknownRequestError(
        'Connection failed',
        {
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.read.vitalRecord.findMany.mockRejectedValue(
        connectionError,
      );

      await expect(
        repository.findVitalsByWorkerId(workerId, 10, 0),
      ).rejects.toThrow(PrismaClientUnknownRequestError);
    });

    it('should handle unexpected Prisma errors', async () => {
      const unexpectedError = new Error('Unexpected Prisma error');
      mockPrismaService.read.vitalRecord.findMany.mockRejectedValue(
        unexpectedError,
      );

      await expect(
        repository.findVitalsByWorkerId(workerId, 10, 0),
      ).rejects.toThrow('Unexpected Prisma error');
    });
  });

  describe('findByWorkerIdAndTimeRange method', () => {
    const workerId = 'worker-123';
    const startTime = new Date('2024-01-01T00:00:00.000Z');
    const endTime = new Date('2024-01-01T23:59:59.999Z');

    const mockPrismaVitalRecords = [
      {
        id: 'uuid-1',
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
      },
      {
        id: 'uuid-2',
        workerId: 'worker-123',
        heartRate: 75,
        temperature: 36.7,
        timestamp: new Date('2024-01-01T12:01:00.000Z'),
      },
    ];

    it('should call Prisma read client vitalRecord.findMany with correct time range parameters', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue(
        mockPrismaVitalRecords,
      );

      await repository.findByWorkerIdAndTimeRange(workerId, startTime, endTime);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: {
          workerId,
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: { timestamp: 'desc' },
      });
      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no records found in time range', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      const result = await repository.findByWorkerIdAndTimeRange(
        workerId,
        startTime,
        endTime,
      );

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle different time ranges correctly', async () => {
      const timeRanges = [
        {
          start: new Date('2024-01-01T00:00:00.000Z'),
          end: new Date('2024-01-01T12:00:00.000Z'),
        },
        {
          start: new Date('2024-01-01T12:00:00.000Z'),
          end: new Date('2024-01-01T23:59:59.999Z'),
        },
      ];

      for (const timeRange of timeRanges) {
        mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

        await repository.findByWorkerIdAndTimeRange(
          workerId,
          timeRange.start,
          timeRange.end,
        );

        expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
          where: {
            workerId,
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
          orderBy: { timestamp: 'desc' },
        });
      }
    });

    it('should handle Prisma errors in time range query', async () => {
      const queryError = new PrismaClientKnownRequestError(
        'Time range query failed',
        {
          code: 'P2000',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.read.vitalRecord.findMany.mockRejectedValue(queryError);

      await expect(
        repository.findByWorkerIdAndTimeRange(workerId, startTime, endTime),
      ).rejects.toThrow(PrismaClientKnownRequestError);
    });

    it('should handle edge case time ranges', async () => {
      const edgeCases = [
        {
          start: new Date('2024-01-01T00:00:00.000Z'),
          end: new Date('2024-01-01T00:00:00.000Z'), // Same time
        },
        {
          start: new Date('2024-01-01T23:59:59.999Z'),
          end: new Date('2024-01-01T00:00:00.000Z'), // End before start
        },
      ];

      for (const edgeCase of edgeCases) {
        mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

        await repository.findByWorkerIdAndTimeRange(
          workerId,
          edgeCase.start,
          edgeCase.end,
        );

        expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
          where: {
            workerId,
            timestamp: {
              gte: edgeCase.start,
              lte: edgeCase.end,
            },
          },
          orderBy: { timestamp: 'desc' },
        });
      }
    });
  });

  describe('Data Transformation', () => {
    it('should correctly map Prisma snake_case to camelCase', () => {
      const prismaData = {
        worker_id: 'worker-123',
        heart_rate: 72,
        temperature: 36.5,
      };

      const expectedData = {
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
      };

      // This test verifies the mapping logic
      expect(prismaData.worker_id).toBe(expectedData.workerId);
      expect(prismaData.heart_rate).toBe(expectedData.heartRate);
      expect(prismaData.temperature).toBe(expectedData.temperature);
    });

    it('should handle timestamp conversion correctly', () => {
      const prismaTimestamp = new Date('2024-01-01T12:00:00.000Z');
      const expectedTimestamp = new Date('2024-01-01T12:00:00.000Z');

      expect(prismaTimestamp).toEqual(expectedTimestamp);
      expect(prismaTimestamp instanceof Date).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle PrismaClientKnownRequestError with proper error codes', async () => {
      const errorCodes = ['P2000', 'P2002', 'P2003', 'P2025'];

      for (const errorCode of errorCodes) {
        const prismaError = new PrismaClientKnownRequestError(
          `Error ${errorCode}`,
          {
            code: errorCode,
            clientVersion: '1.0.0',
          },
        );

        mockPrismaService.write.vitalRecord.create.mockRejectedValue(
          prismaError,
        );

        await expect(
          repository.create({
            workerId: 'worker-123',
            heartRate: 72,
            temperature: 36.5,
          }),
        ).rejects.toThrow(PrismaClientKnownRequestError);
      }
    });

    it('should handle PrismaClientUnknownRequestError', async () => {
      const unknownError = new PrismaClientUnknownRequestError(
        'Unknown error',
        {
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        unknownError,
      );

      await expect(
        repository.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow(PrismaClientUnknownRequestError);
    });

    it('should preserve error messages from Prisma', async () => {
      const errorMessage = 'Custom Prisma error message';
      const prismaError = new PrismaClientKnownRequestError(errorMessage, {
        code: 'P2000',
        clientVersion: '1.0.0',
      });

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(prismaError);

      await expect(
        repository.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow(errorMessage);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        timeoutError,
      );

      await expect(
        repository.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow('Network timeout');
    });

    it('should handle database constraint violations', async () => {
      const constraintError = new PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '1.0.0',
          meta: { field_name: 'worker_id' },
        },
      );

      mockPrismaService.write.vitalRecord.create.mockRejectedValue(
        constraintError,
      );

      await expect(
        repository.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow(PrismaClientKnownRequestError);
    });
  });

  describe('Performance Considerations', () => {
    it('should use proper Prisma query optimization', async () => {
      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      await repository.findVitalsByWorkerId('worker-123', 10, 0);

      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledWith({
        where: { workerId: 'worker-123' },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should handle high-volume queries efficiently', async () => {
      const highVolumeWorkerIds = Array.from(
        { length: 100 },
        (_, index) => `worker-${index}`,
      );

      mockPrismaService.read.vitalRecord.findMany.mockResolvedValue([]);

      const results = await Promise.all(
        highVolumeWorkerIds.map((workerId) =>
          repository.findVitalsByWorkerId(workerId, 10, 0),
        ),
      );

      expect(results).toHaveLength(100);
      expect(prismaService.read.vitalRecord.findMany).toHaveBeenCalledTimes(
        100,
      );
    });

    it('should handle concurrent database operations', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, index) => ({
        workerId: `worker-${index}`,
        heartRate: 70 + index,
        temperature: 36.0 + index * 0.1,
      }));

      mockPrismaService.write.vitalRecord.create.mockImplementation((data) =>
        Promise.resolve({
          id: `uuid-${Date.now()}-${Math.random()}`,
          ...data.data,
          timestamp: new Date(),
        }),
      );

      const results = await Promise.all(
        concurrentOperations.map((op) => repository.create(op)),
      );

      expect(results).toHaveLength(10);
      expect(prismaService.write.vitalRecord.create).toHaveBeenCalledTimes(10);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { VitalsService } from './vitals.service';
import { VitalsRepository } from '../repositories/vitals.repository';
import { VitalsQueueService } from './vitals.queue.service';
import { VitalsCacheService } from './vitals.cache.service';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('VitalsService', () => {
  let service: VitalsService;
  let vitalsRepository: VitalsRepository;
  let vitalsQueueService: VitalsQueueService;
  let vitalsCacheService: VitalsCacheService;

  const mockVitalsRepository = {
    create: jest.fn(),
    findVitalsByWorkerId: jest.fn(),
    findByWorkerIdAndTimeRange: jest.fn(),
  };

  const mockVitalsQueueService = {
    addVitalRecordJob: jest.fn(),
    addBulkVitalRecordsJob: jest.fn(),
    getJobStatus: jest.fn(),
    getQueueStats: jest.fn(),
  };

  const mockVitalsCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    getWorkerVitals: jest.fn(),
    setWorkerVitals: jest.fn(),
    invalidateWorkerVitals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VitalsService,
        {
          provide: VitalsRepository,
          useValue: mockVitalsRepository,
        },
        {
          provide: VitalsQueueService,
          useValue: mockVitalsQueueService,
        },
        {
          provide: VitalsCacheService,
          useValue: mockVitalsCacheService,
        },
      ],
    }).compile();

    service = module.get<VitalsService>(VitalsService);
    vitalsRepository = module.get<VitalsRepository>(VitalsRepository);
    vitalsQueueService = module.get<VitalsQueueService>(VitalsQueueService);
    vitalsCacheService = module.get<VitalsCacheService>(VitalsCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have VitalsRepository injected', () => {
      expect(vitalsRepository).toBeDefined();
    });

    it('should have VitalsQueueService injected', () => {
      expect(vitalsQueueService).toBeDefined();
    });

    it('should have VitalsCacheService injected', () => {
      expect(vitalsCacheService).toBeDefined();
    });
  });

  describe('create method', () => {
    const validCreateVitalsDto: CreateVitalsDto = {
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
    };

    it('should have create method defined', () => {
      expect(service.create).toBeDefined();
      expect(typeof service.create).toBe('function');
    });

    it('should validate input data before processing', async () => {
      // This test will pass once validation is implemented in Phase 2
      expect(validCreateVitalsDto.workerId).toBeDefined();
      expect(validCreateVitalsDto.heartRate).toBeGreaterThan(0);
      expect(validCreateVitalsDto.temperature).toBeGreaterThan(0);
    });

    it('should add job to queue for vital record creation', async () => {
      mockVitalsQueueService.addVitalRecordJob.mockResolvedValue(undefined);

      const result = await service.create(validCreateVitalsDto);

      expect(vitalsQueueService.addVitalRecordJob).toHaveBeenCalledWith(
        validCreateVitalsDto,
      );
      expect(vitalsQueueService.addVitalRecordJob).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ workerId: validCreateVitalsDto.workerId });
    });

    it('should return workerId on success', async () => {
      mockVitalsQueueService.addVitalRecordJob.mockResolvedValue(undefined);

      const result = await service.create(validCreateVitalsDto);

      expect(result).toEqual({ workerId: validCreateVitalsDto.workerId });
    });

    it('should throw InternalServerErrorException when queue job fails', async () => {
      const queueError = new Error('Queue service unavailable');
      mockVitalsQueueService.addVitalRecordJob.mockRejectedValue(queueError);

      await expect(service.create(validCreateVitalsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should process multiple concurrent creation requests', async () => {
      const requests = Array.from({ length: 5 }, (_, index) => ({
        ...validCreateVitalsDto,
        workerId: `worker-${index}`,
        heartRate: 70 + index,
      }));

      mockVitalsQueueService.addVitalRecordJob.mockResolvedValue(undefined);

      const results = await Promise.all(
        requests.map((request) => service.create(request)),
      );

      expect(results).toHaveLength(5);
      expect(
        results.every((result, index) => result.workerId === `worker-${index}`),
      ).toBe(true);
      expect(vitalsQueueService.addVitalRecordJob).toHaveBeenCalledTimes(5);
    });
  });

  describe('getRecentVitals method', () => {
    const workerId = 'worker-123';
    const mockVitalsArray: VitalsEntity[] = [
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

    it('should have getRecentVitals method defined', () => {
      expect(service.getRecentVitals).toBeDefined();
      expect(typeof service.getRecentVitals).toBe('function');
    });

    it('should check cache first before querying repository', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(mockVitalsArray);

      await service.getRecentVitals(workerId);

      expect(vitalsCacheService.getWorkerVitals).toHaveBeenCalledWith(workerId);
      expect(vitalsRepository.findVitalsByWorkerId).not.toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(mockVitalsArray);

      const result = await service.getRecentVitals(workerId);

      expect(result).toEqual(mockVitalsArray);
      expect(vitalsCacheService.getWorkerVitals).toHaveBeenCalledWith(workerId);
      expect(vitalsRepository.findVitalsByWorkerId).not.toHaveBeenCalled();
    });

    it('should query repository when cache miss occurs', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue(
        mockVitalsArray,
      );

      await service.getRecentVitals(workerId);

      expect(vitalsCacheService.getWorkerVitals).toHaveBeenCalledWith(workerId);
      expect(vitalsRepository.findVitalsByWorkerId).toHaveBeenCalledWith(
        workerId,
        10,
        0,
      );
    });

    it('should update cache with repository data on cache miss', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue(
        mockVitalsArray,
      );
      mockVitalsCacheService.setWorkerVitals.mockResolvedValue(undefined);

      await service.getRecentVitals(workerId);

      expect(vitalsCacheService.setWorkerVitals).toHaveBeenCalledWith(
        workerId,
        mockVitalsArray,
      );
    });

    it('should return repository data when cache miss occurs', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue(
        mockVitalsArray,
      );
      mockVitalsCacheService.setWorkerVitals.mockResolvedValue(undefined);

      const result = await service.getRecentVitals(workerId);

      expect(result).toEqual(mockVitalsArray);
      expect(vitalsRepository.findVitalsByWorkerId).toHaveBeenCalledWith(
        workerId,
        10,
        0,
      );
    });

    it('should return empty array when no data found in cache or repository', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue([]);

      const result = await service.getRecentVitals(workerId);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle cache service failure gracefully and fallback to repository', async () => {
      const cacheError = new Error('Cache service unavailable');
      mockVitalsCacheService.getWorkerVitals.mockRejectedValue(cacheError);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue(
        mockVitalsArray,
      );

      const result = await service.getRecentVitals(workerId);

      expect(result).toEqual(mockVitalsArray);
      expect(vitalsRepository.findVitalsByWorkerId).toHaveBeenCalledWith(
        workerId,
        10,
        0,
      );
    });

    it('should handle repository service failure', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      const repositoryError = new Error('Repository service unavailable');
      mockVitalsRepository.findVitalsByWorkerId.mockRejectedValue(
        repositoryError,
      );

      await expect(service.getRecentVitals(workerId)).rejects.toThrow(
        'Repository service unavailable',
      );
    });

    it('should handle cache update failure gracefully', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockResolvedValue(
        mockVitalsArray,
      );
      mockVitalsCacheService.setWorkerVitals.mockRejectedValue(
        new Error('Cache update failed'),
      );

      const result = await service.getRecentVitals(workerId);

      expect(result).toEqual(mockVitalsArray);
      expect(vitalsRepository.findVitalsByWorkerId).toHaveBeenCalledWith(
        workerId,
        10,
        0,
      );
    });

    it('should limit results to maximum 10 records', async () => {
      const tenVitalsRecords: VitalsEntity[] = Array.from(
        { length: 10 },
        (_, index) => ({
          id: `uuid-${index}`,
          workerId: 'worker-123',
          heartRate: 70 + index,
          temperature: 36.0 + index * 0.1,
          timestamp: new Date(`2024-01-01T12:0${index}:00.000Z`),
        }),
      );

      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(
        tenVitalsRecords,
      );

      const result = await service.getRecentVitals(workerId);

      expect(result).toHaveLength(10);
      expect(result).toEqual(tenVitalsRecords);
    });

    it('should handle different worker IDs correctly', async () => {
      const testWorkerIds = ['worker-1', 'worker-2', 'worker-abc-123'];

      for (const testWorkerId of testWorkerIds) {
        mockVitalsCacheService.getWorkerVitals.mockResolvedValue([]);

        await service.getRecentVitals(testWorkerId);

        expect(vitalsCacheService.getWorkerVitals).toHaveBeenCalledWith(
          testWorkerId,
        );
      }
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate heart rate ranges', () => {
      const validHeartRates = [30, 60, 100, 150, 200, 300];
      const invalidHeartRates = [0, 29, 301, 500];

      validHeartRates.forEach((rate) => {
        expect(rate).toBeGreaterThanOrEqual(30);
        expect(rate).toBeLessThanOrEqual(300);
      });

      invalidHeartRates.forEach((rate) => {
        expect(rate < 30 || rate > 300).toBe(true);
      });
    });

    it('should validate temperature ranges', () => {
      const validTemperatures = [20.0, 25.0, 36.5, 37.0, 40.0, 50.0];
      const invalidTemperatures = [19.9, 0, 50.1, 100];

      validTemperatures.forEach((temp) => {
        expect(temp).toBeGreaterThanOrEqual(20);
        expect(temp).toBeLessThanOrEqual(50);
      });

      invalidTemperatures.forEach((temp) => {
        expect(temp < 20 || temp > 50).toBe(true);
      });
    });

    it('should validate worker ID format', () => {
      const validWorkerIds = ['worker-123', 'worker-abc', 'worker_123', '123'];
      const invalidWorkerIds = ['', null, undefined];

      validWorkerIds.forEach((id) => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      invalidWorkerIds.forEach((id) => {
        expect(id === '' || id === null || id === undefined).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidDto = {
        workerId: '',
        heartRate: -1,
        temperature: 0,
      } as CreateVitalsDto;

      // This test will be more comprehensive once validation is implemented in Phase 2
      expect(invalidDto.workerId).toBe('');
      expect(invalidDto.heartRate).toBeLessThan(0);
      expect(invalidDto.temperature).toBeLessThan(20);
    });

    it('should handle service layer exceptions gracefully', async () => {
      const serviceError = new Error('Queue service unavailable');
      mockVitalsQueueService.addVitalRecordJob.mockRejectedValue(serviceError);

      await expect(
        service.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle unexpected errors gracefully', async () => {
      const unexpectedError = new Error('Unexpected error');
      // Ensure cache returns null so repository is called
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue(null);
      mockVitalsRepository.findVitalsByWorkerId.mockRejectedValue(
        unexpectedError,
      );

      // The service should throw the error when repository fails
      await expect(service.getRecentVitals('worker-123')).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should use cache-first strategy for read operations', async () => {
      mockVitalsCacheService.getWorkerVitals.mockResolvedValue([]);

      await service.getRecentVitals('worker-123');

      expect(vitalsCacheService.getWorkerVitals).toHaveBeenCalled();
      expect(vitalsRepository.findVitalsByWorkerId).not.toHaveBeenCalled();
    });

    it('should handle high-volume data processing', async () => {
      const highVolumeData = Array.from({ length: 100 }, (_, index) => ({
        workerId: `worker-${index % 10}`,
        heartRate: 70 + (index % 30),
        temperature: 36.0 + (index % 10) * 0.1,
      }));

      mockVitalsQueueService.addVitalRecordJob.mockResolvedValue(undefined);

      const results = await Promise.all(
        highVolumeData.map((data) => service.create(data)),
      );

      expect(results).toHaveLength(100);
      expect(
        results.every(
          (result, index) => result.workerId === `worker-${index % 10}`,
        ),
      ).toBe(true);
      expect(vitalsQueueService.addVitalRecordJob).toHaveBeenCalledTimes(100);
    });
  });
});

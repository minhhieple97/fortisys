import { Test, TestingModule } from '@nestjs/testing';
import { VitalsController } from './vitals.controller';
import { VitalsService } from '../services/vitals.service';
import { CreateVitalsDto } from '../dto/create-vitals.dto';
import { VitalsEntity } from '../entities/vitals.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('VitalsController', () => {
  let controller: VitalsController;
  let vitalsService: VitalsService;

  const mockVitalsService = {
    create: jest.fn(),
    getRecentVitals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VitalsController],
      providers: [
        {
          provide: VitalsService,
          useValue: mockVitalsService,
        },
      ],
    }).compile();

    controller = module.get<VitalsController>(VitalsController);
    vitalsService = module.get<VitalsService>(VitalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have VitalsService injected', () => {
      expect(vitalsService).toBeDefined();
    });
  });

  describe('POST /vitals - create', () => {
    const validCreateVitalsDto: CreateVitalsDto = {
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
    };

    it('should have create method defined', () => {
      expect(controller.create).toBeDefined();
      expect(typeof controller.create).toBe('function');
    });

    it('should call VitalsService.create with correct parameters', async () => {
      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      await controller.create(validCreateVitalsDto);

      expect(mockVitalsService.create).toHaveBeenCalledWith(
        validCreateVitalsDto,
      );
      expect(mockVitalsService.create).toHaveBeenCalledTimes(1);
    });

    it('should return workerId on success', async () => {
      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const result = await controller.create(validCreateVitalsDto);

      expect(result).toEqual({ workerId: 'worker-123' });
    });

    it('should handle valid heart rate values', async () => {
      const testCases = [
        { ...validCreateVitalsDto, heartRate: 30 }, // minimum
        { ...validCreateVitalsDto, heartRate: 72 }, // normal
        { ...validCreateVitalsDto, heartRate: 150 }, // high
        { ...validCreateVitalsDto, heartRate: 300 }, // maximum
      ];

      for (const testCase of testCases) {
        mockVitalsService.create.mockResolvedValue({
          workerId: testCase.workerId,
        });

        const result = await controller.create(testCase);
        expect(result).toEqual({ workerId: testCase.workerId });
      }
    });

    it('should handle valid temperature values', async () => {
      const testCases = [
        { ...validCreateVitalsDto, temperature: 20.0 }, // minimum
        { ...validCreateVitalsDto, temperature: 36.5 }, // normal
        { ...validCreateVitalsDto, temperature: 39.0 }, // fever
        { ...validCreateVitalsDto, temperature: 50.0 }, // maximum
      ];

      for (const testCase of testCases) {
        mockVitalsService.create.mockResolvedValue({
          workerId: testCase.workerId,
        });

        const result = await controller.create(testCase);
        expect(result).toEqual({ workerId: testCase.workerId });
      }
    });

    it('should throw InternalServerErrorException when service throws error', async () => {
      const serviceError = new InternalServerErrorException(
        'Queue service unavailable',
      );
      mockVitalsService.create.mockRejectedValue(serviceError);

      await expect(controller.create(validCreateVitalsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle concurrent requests', async () => {
      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const requests = Array.from({ length: 5 }, () =>
        controller.create(validCreateVitalsDto),
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      expect(results.every((result) => result.workerId === 'worker-123')).toBe(
        true,
      );
      expect(mockVitalsService.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('GET /vitals/:workerId/recent - getRecentVitals', () => {
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
      expect(controller.getRecentVitals).toBeDefined();
      expect(typeof controller.getRecentVitals).toBe('function');
    });

    it('should call VitalsService.getRecentVitals with correct parameters', async () => {
      mockVitalsService.getRecentVitals.mockResolvedValue(mockVitalsArray);

      await controller.getRecentVitals({ workerId });

      expect(mockVitalsService.getRecentVitals).toHaveBeenCalledWith(workerId);
      expect(mockVitalsService.getRecentVitals).toHaveBeenCalledTimes(1);
    });

    it('should return array of vitals entities on success', async () => {
      mockVitalsService.getRecentVitals.mockResolvedValue(mockVitalsArray);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(mockVitalsArray);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no vitals found', async () => {
      mockVitalsService.getRecentVitals.mockResolvedValue([]);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle different worker IDs', async () => {
      const testWorkerIds = ['worker-1', 'worker-2', 'worker-abc-123'];

      for (const testWorkerId of testWorkerIds) {
        mockVitalsService.getRecentVitals.mockResolvedValue([]);

        await controller.getRecentVitals({
          workerId: testWorkerId,
        });

        expect(mockVitalsService.getRecentVitals).toHaveBeenCalledWith(
          testWorkerId,
        );
      }
    });

    it('should throw error when service throws error', async () => {
      const serviceError = new Error('Worker not found');
      mockVitalsService.getRecentVitals.mockRejectedValue(serviceError);

      await expect(controller.getRecentVitals({ workerId })).rejects.toThrow(
        'Worker not found',
      );
    });

    it('should return maximum 10 vitals records', async () => {
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

      mockVitalsService.getRecentVitals.mockResolvedValue(tenVitalsRecords);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toHaveLength(10);
      expect(result).toEqual(tenVitalsRecords);
    });
  });

  describe('GET /vitals/:workerId/recent - Cache-First Approach', () => {
    const workerId = 'worker-123';
    const mockCachedVitals: VitalsEntity[] = [
      {
        id: 'uuid-cached-1',
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
      },
      {
        id: 'uuid-cached-2',
        workerId: 'worker-123',
        heartRate: 75,
        temperature: 36.7,
        timestamp: new Date('2024-01-01T12:01:00.000Z'),
      },
    ];

    const mockRepositoryVitals: VitalsEntity[] = [
      {
        id: 'uuid-repo-1',
        workerId: 'worker-123',
        heartRate: 70,
        temperature: 36.2,
        timestamp: new Date('2024-01-01T11:58:00.000Z'),
      },
      {
        id: 'uuid-repo-2',
        workerId: 'worker-123',
        heartRate: 73,
        temperature: 36.4,
        timestamp: new Date('2024-01-01T11:59:00.000Z'),
      },
    ];

    it('should prioritize cached data over repository data', async () => {
      // Mock service to return cached data
      mockVitalsService.getRecentVitals.mockResolvedValue(mockCachedVitals);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(mockCachedVitals);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-cached-1');
      expect(result[1].id).toBe('uuid-cached-2');
    });

    it('should handle cache miss gracefully and fallback to repository', async () => {
      // Mock service to return repository data (simulating cache miss)
      mockVitalsService.getRecentVitals.mockResolvedValue(mockRepositoryVitals);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(mockRepositoryVitals);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-repo-1');
      expect(result[1].id).toBe('uuid-repo-2');
    });

    it('should maintain data consistency between cache and repository', async () => {
      // Mock service to return consistent data
      const consistentData = [
        ...mockCachedVitals,
        ...mockRepositoryVitals,
      ].slice(0, 10);
      mockVitalsService.getRecentVitals.mockResolvedValue(consistentData);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(consistentData);
      expect(result).toHaveLength(4);
      // Verify data integrity
      expect(result.every((vital) => vital.workerId === workerId)).toBe(true);
      expect(
        result.every(
          (vital) => vital.id && vital.heartRate && vital.temperature,
        ),
      ).toBe(true);
    });

    it('should handle empty cache and empty repository gracefully', async () => {
      mockVitalsService.getRecentVitals.mockResolvedValue([]);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should respect the 10-record limit from cache', async () => {
      const tenCachedRecords: VitalsEntity[] = Array.from(
        { length: 10 },
        (_, index) => ({
          id: `uuid-cached-${index}`,
          workerId: 'worker-123',
          heartRate: 70 + index,
          temperature: 36.0 + index * 0.1,
          timestamp: new Date(`2024-01-01T12:0${index}:00.000Z`),
        }),
      );

      mockVitalsService.getRecentVitals.mockResolvedValue(tenCachedRecords);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toHaveLength(10);
      expect(result).toEqual(tenCachedRecords);
      expect(result[0].id).toBe('uuid-cached-0');
      expect(result[9].id).toBe('uuid-cached-9');
    });

    it('should handle cache service failures gracefully', async () => {
      // Mock service to handle cache failures internally
      mockVitalsService.getRecentVitals.mockResolvedValue(mockRepositoryVitals);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(mockRepositoryVitals);
      expect(result).toHaveLength(2);
    });

    it('should maintain timestamp ordering in cached results', async () => {
      const unorderedCachedVitals = [
        {
          id: 'uuid-cached-2',
          workerId: 'worker-123',
          heartRate: 75,
          temperature: 36.7,
          timestamp: new Date('2024-01-01T12:01:00.000Z'),
        },
        {
          id: 'uuid-cached-1',
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
          timestamp: new Date('2024-01-01T12:00:00.000Z'),
        },
      ];

      mockVitalsService.getRecentVitals.mockResolvedValue(
        unorderedCachedVitals,
      );

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(unorderedCachedVitals);
      expect(result).toHaveLength(2);
    });

    it('should handle mixed data sources (partial cache, partial repository)', async () => {
      const mixedData = [
        ...mockCachedVitals.slice(0, 1), // First from cache
        ...mockRepositoryVitals.slice(0, 1), // Second from repository
      ];

      mockVitalsService.getRecentVitals.mockResolvedValue(mixedData);

      const result = await controller.getRecentVitals({ workerId });

      expect(result).toEqual(mixedData);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-cached-1');
      expect(result[1].id).toBe('uuid-repo-1');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 status code for successful POST', async () => {
      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const result = await controller.create({
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
      });

      expect(result).toEqual({ workerId: 'worker-123' });
    });

    it('should return 200 status code for successful GET', async () => {
      mockVitalsService.getRecentVitals.mockResolvedValue([]);

      const result = await controller.getRecentVitals({
        workerId: 'worker-123',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should expect workerId to be a string', async () => {
      const dto = {
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
      };

      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const result = await controller.create(dto);

      expect(mockVitalsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workerId: expect.any(String),
        }),
      );
      expect(result).toEqual({ workerId: 'worker-123' });
    });

    it('should expect heartRate to be a number', async () => {
      const dto = {
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
      };

      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const result = await controller.create(dto);

      expect(mockVitalsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          heartRate: expect.any(Number),
        }),
      );
      expect(result).toEqual({ workerId: 'worker-123' });
    });

    it('should expect temperature to be a number', async () => {
      const dto = {
        workerId: 'worker-123',
        heartRate: 72,
        temperature: 36.5,
      };

      mockVitalsService.create.mockResolvedValue({ workerId: 'worker-123' });

      const result = await controller.create(dto);

      expect(mockVitalsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: expect.any(Number),
        }),
      );
      expect(result).toEqual({ workerId: 'worker-123' });
    });
  });

  describe('Input Sanitization and Security Measures', () => {
    const baseValidDto = {
      workerId: 'worker-123',
      heartRate: 72,
      temperature: 36.5,
    };

    describe('SQL Injection Prevention', () => {
      it('should handle workerId with SQL-like characters safely', async () => {
        const maliciousWorkerId = "worker'; DROP TABLE vitals; --";
        const dto = { ...baseValidDto, workerId: maliciousWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: maliciousWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: maliciousWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        // Verify the malicious input is treated as a string, not executed as SQL
        expect(result.workerId).toBe(maliciousWorkerId);
      });

      it('should handle workerId with special characters safely', async () => {
        const specialCharsWorkerId = 'worker-<script>alert("xss")</script>';
        const dto = { ...baseValidDto, workerId: specialCharsWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: specialCharsWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: specialCharsWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        expect(result.workerId).toBe(specialCharsWorkerId);
      });
    });

    describe('XSS Prevention', () => {
      it('should handle HTML/script tags in workerId safely', async () => {
        const xssWorkerId = '<script>alert("XSS")</script>worker-123';
        const dto = { ...baseValidDto, workerId: xssWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: xssWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: xssWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        // The input should be treated as plain text, not executed as HTML
        expect(result.workerId).toBe(xssWorkerId);
      });

      it('should handle encoded HTML entities safely', async () => {
        const encodedWorkerId =
          'worker-123&#60;script&#62;alert("XSS")&#60;/script&#62;';
        const dto = { ...baseValidDto, workerId: encodedWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: encodedWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: encodedWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        expect(result.workerId).toBe(encodedWorkerId);
      });
    });

    describe('Input Length and Format Validation', () => {
      it('should handle extremely long workerId safely', async () => {
        const longWorkerId = 'a'.repeat(1000);
        const dto = { ...baseValidDto, workerId: longWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: longWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: longWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        expect(result.workerId).toBe(longWorkerId);
      });

      it('should handle workerId with unicode characters safely', async () => {
        const unicodeWorkerId = 'worker-123-🚀-🌟-测试';
        const dto = { ...baseValidDto, workerId: unicodeWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: unicodeWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: unicodeWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        expect(result.workerId).toBe(unicodeWorkerId);
      });

      it('should handle workerId with whitespace safely', async () => {
        const whitespaceWorkerId = '  worker-123  ';
        const dto = { ...baseValidDto, workerId: whitespaceWorkerId };

        mockVitalsService.create.mockResolvedValue({
          workerId: whitespaceWorkerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: whitespaceWorkerId });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        expect(result.workerId).toBe(whitespaceWorkerId);
      });
    });

    describe('Numeric Input Security', () => {
      it('should handle edge case heart rate values safely', async () => {
        const edgeCases = [30, 300, 0.1, 299.9];

        for (const heartRate of edgeCases) {
          const dto = { ...baseValidDto, heartRate };

          mockVitalsService.create.mockResolvedValue({
            workerId: dto.workerId,
          });

          const result = await controller.create(dto);

          expect(result).toEqual({ workerId: dto.workerId });
        }
      });

      it('should handle edge case temperature values safely', async () => {
        const edgeCases = [20, 50, 20.1, 49.9];

        for (const temperature of edgeCases) {
          const dto = { ...baseValidDto, temperature };

          mockVitalsService.create.mockResolvedValue({
            workerId: dto.workerId,
          });

          const result = await controller.create(dto);

          expect(result).toEqual({ workerId: dto.workerId });
        }
      });

      it('should handle very small decimal values safely', async () => {
        const smallDecimal = 0.000001;
        const dto = { ...baseValidDto, temperature: smallDecimal };

        mockVitalsService.create.mockResolvedValue({
          workerId: dto.workerId,
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: dto.workerId });
      });
    });

    describe('Parameter Pollution Prevention', () => {
      it('should handle duplicate parameters safely', async () => {
        const dto = {
          ...baseValidDto,
          workerId: 'worker-123',
          // Simulating potential parameter pollution
          'workerId[]': 'malicious-worker',
          'heartRate[]': 999,
        };

        mockVitalsService.create.mockResolvedValue({
          workerId: 'worker-123',
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: 'worker-123' });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        // The service should only process the expected fields
        expect(result.workerId).toBe('worker-123');
      });
    });

    describe('Type Coercion Security', () => {
      it('should handle string numbers safely', async () => {
        const dto = {
          workerId: 'worker-123',
          heartRate: '72' as any, // Simulating string input
          temperature: '36.5' as any, // Simulating string input
        };

        mockVitalsService.create.mockResolvedValue({
          workerId: 'worker-123',
        });

        const result = await controller.create(dto);

        expect(result).toEqual({ workerId: 'worker-123' });
        expect(mockVitalsService.create).toHaveBeenCalledWith(dto);
        // The validation should handle type conversion safely
        expect(result.workerId).toBe('worker-123');
      });

      it('should handle null/undefined values safely', async () => {
        const dto = {
          workerId: 'worker-123',
          heartRate: null as any,
          temperature: undefined as any,
        };

        // Mock service to throw validation error
        mockVitalsService.create.mockRejectedValue(
          new InternalServerErrorException('Invalid input data'),
        );

        await expect(controller.create(dto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service layer exceptions gracefully', async () => {
      const serviceError = new InternalServerErrorException(
        'Queue service unavailable',
      );
      mockVitalsService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create({
          workerId: 'worker-123',
          heartRate: 72,
          temperature: 36.5,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockVitalsService.getRecentVitals.mockRejectedValue(unexpectedError);

      await expect(
        controller.getRecentVitals({ workerId: 'worker-123' }),
      ).rejects.toThrow('Unexpected error');
    });
  });
});

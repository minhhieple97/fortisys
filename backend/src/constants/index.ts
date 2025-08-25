// Queue Configuration
export const QUEUE_VITAL_NAME = 'vital-records-queue';

// Redis Configuration
export const REDIS_DEFAULT_HOST = 'localhost';
export const REDIS_DEFAULT_PORT = 6379;
export const REDIS_RETRY_DELAY_ON_FAILOVER = 100;
export const REDIS_MAX_LOADING_TIMEOUT = 10000;

// BullMQ Configuration
export const BULLMQ_DEFAULT_ATTEMPTS = 3;
export const BULLMQ_DEFAULT_BACKOFF_DELAY = 2000;
export const BULLMQ_DEFAULT_REMOVE_ON_COMPLETE = 100;
export const BULLMQ_DEFAULT_REMOVE_ON_FAIL = 50;

// Server Configuration
export const SERVER_DEFAULT_PORT = 3000;
export const SERVER_DEFAULT_FRONTEND_URL = 'http://localhost:3000';
export const SERVER_API_PREFIX = 'api/v1';

// Vitals Configuration
export const VITALS_MAX_PER_WORKER = 10;
export const VITALS_DEFAULT_LIMIT = 10;
export const VITALS_DEFAULT_OFFSET = 0;

// Heart Rate Validation
export const HEART_RATE_MIN = 30;
export const HEART_RATE_MAX = 300;

// Temperature Validation
export const TEMPERATURE_MIN = 20;
export const TEMPERATURE_MAX = 50;

// Worker ID Validation
export const WORKER_ID_MIN_LENGTH = 3;
export const WORKER_ID_MAX_LENGTH = 50;

// Pagination Limits
export const PAGINATION_MIN_LIMIT = 1;
export const PAGINATION_MAX_LIMIT = 100;
export const PAGINATION_MAX_LIMIT_EXTENDED = 1000;
export const PAGINATION_MIN_OFFSET = 0;

// Decimal Precision
export const DECIMAL_PRECISION = 100; // For rounding to 2 decimal places

// Cache Configuration
export const CACHE_KEY_PREFIX = 'worker';
export const CACHE_KEY_SUFFIX = 'vitals';
export const CACHE_HIT_COUNT_FIELD = 'cacheHitCount';

// Error Messages
export const ERROR_MESSAGES = {
  WORKER_ID_REQUIRED: 'Worker ID is required',
  WORKER_ID_MUST_BE_STRING: 'Worker ID must be a string',
  WORKER_ID_INVALID_FORMAT:
    'Worker ID can only contain letters, numbers, hyphens, and underscores',
  HEART_RATE_REQUIRED: 'Heart rate is required',
  HEART_RATE_MUST_BE_NUMBER: 'Heart rate must be a valid number',
  HEART_RATE_MIN: 'Heart rate must be at least 30 bpm',
  HEART_RATE_MAX: 'Heart rate must not exceed 300 bpm',
  TEMPERATURE_REQUIRED: 'Temperature is required',
  TEMPERATURE_MUST_BE_NUMBER: 'Temperature must be a valid number',
  TEMPERATURE_MIN: 'Temperature must be at least 20°C',
  TEMPERATURE_MAX: 'Temperature must not exceed 50°C',
  TIMESTAMP_INVALID: 'Timestamp must be a valid ISO date string',
  LIMIT_MUST_BE_INTEGER: 'Limit must be an integer',
  LIMIT_MIN: 'Limit must be at least 1',
  LIMIT_MAX: 'Limit cannot exceed 100',
  LIMIT_MAX_EXTENDED: 'Limit cannot exceed 1000',
  OFFSET_MUST_BE_INTEGER: 'Offset must be an integer',
  OFFSET_MIN: 'Offset must be non-negative',
  START_TIME_REQUIRED: 'Start time is required',
  END_TIME_REQUIRED: 'End time is required',
  QUEUE_JOB_FAILED: 'Failed to add job to queue, falling back to sync creation',
} as const;

// API Examples
export const API_EXAMPLES = {
  WORKER_ID: 'worker-123',
  HEART_RATE: 72,
  TEMPERATURE: 36.5,
  TIMESTAMP: '2024-01-01T12:00:00.000Z',
  START_TIME: '2024-01-01T00:00:00.000Z',
  END_TIME: '2024-01-01T23:59:59.999Z',
  UUID: 'uuid-123-456-789',
} as const;

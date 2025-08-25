export type VitalsRecord = {
  id: string;
  workerId: string;
  heartRate: number;
  temperature: number;
  timestamp: string;
};

export type CreateVitalsInput = {
  workerId: string;
  heartRate: number;
  temperature: number;
};

export type VitalsResponse = {
  success: boolean;
  message: string;
  data?: VitalsRecord;
};

export type VitalsQueryParams = {
  workerId: string;
};

// Re-export the Zod schema type for consistency
export type { CreateVitalsFormData } from './schemas';

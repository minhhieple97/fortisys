import { z } from 'zod';

export const CreateVitalsSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required').regex(/^[a-zA-Z0-9_-]+$/, 'Worker ID can only contain letters, numbers, hyphens, and underscores'),
  heartRate: z.number().int().min(40, 'Heart rate must be at least 40 BPM').max(200, 'Heart rate must be at most 200 BPM'),
  temperature: z.number().min(35.0, 'Temperature must be at least 35.0°C').max(42.0, 'Temperature must be at most 42.0°C'),
});

export const VitalsQuerySchema = z.object({
  workerId: z.string().min(1),
});

export type CreateVitalsFormData = z.infer<typeof CreateVitalsSchema>;

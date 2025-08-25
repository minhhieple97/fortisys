'use server';

import { CreateVitalsSchema } from '../schemas';
import { api } from '@/lib/api';
import type { CreateVitalsInput, VitalsResponse } from '../types';

export async function submitVitalsAction(data: CreateVitalsInput): Promise<VitalsResponse> {
  try {
    // Validate input using Zod schema
    const validationResult = CreateVitalsSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Invalid input data',
      };
    }

    const response = await api.submitVitals(validationResult.data);
    return response;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit vitals data',
    };
  }
}

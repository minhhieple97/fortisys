import { api } from '@/lib/api';
import type { VitalsRecord } from '../types';

export const getRecentVitals = async (workerId: string): Promise<VitalsRecord[]> => {
  try {
    return await api.getRecentVitals(workerId);
  } catch (error) {
    console.error('Failed to fetch recent vitals:', error);
    return [];
  }
};

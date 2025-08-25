import type { CreateVitalsInput, VitalsRecord, VitalsResponse } from '@/features/vitals/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = {
  async submitVitals(data: CreateVitalsInput): Promise<VitalsResponse> {
    const response = await fetch(`${API_BASE_URL}/vitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to submit vitals: ${response.statusText}`);
    }
    return response.json();
  },

  async getRecentVitals(workerId: string): Promise<VitalsRecord[]> {
    const response = await fetch(`${API_BASE_URL}/vitals/${workerId}/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vitals: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  },
};

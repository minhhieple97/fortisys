'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateVitalsInput } from '../types';

export const useVitalsQuery = (workerId: string) => {
  return useQuery({
    queryKey: ['vitals', workerId],
    queryFn: () => api.getRecentVitals(workerId),
    refetchInterval: 5000,
    staleTime: 2000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSubmitVitals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVitalsInput) => api.submitVitals(data),
    onSuccess: (data) => {
      console.log('data', data);
      if (data.success && data.data?.workerId) {
        console.log('data', data);
        queryClient.invalidateQueries({
          queryKey: ['vitals', data.data.workerId],
        });
      }

      queryClient.invalidateQueries({ queryKey: ['vitals'] });
    },
    onError: (error) => {
      console.error('Failed to submit vitals:', error);
    },
  });
};

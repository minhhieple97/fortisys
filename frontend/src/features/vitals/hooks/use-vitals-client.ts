'use client';

import { useState } from 'react';
import { submitVitalsAction } from '../actions/submit-vitals';
import type { CreateVitalsInput, VitalsResponse } from '../types';
import { WORKER_ID } from '@/constants';

export const useVitalsClient = () => {
  const [formData, setFormData] = useState<CreateVitalsInput>({
    heartRate: 0,
    temperature: 0,
    workerId: '',
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<VitalsResponse | null>(null);

  const handleInputChange = (field: keyof CreateVitalsInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.heartRate > 0 && formData.temperature > 0) {
      setIsExecuting(true);
      try {
        const result = await submitVitalsAction(formData);
        setResult(result);

        if (result.success) {
          // Reset form on success
          setFormData({ heartRate: 0, temperature: 0, workerId: WORKER_ID });
        }
      } catch (error) {
        setResult({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to submit vitals',
        });
      } finally {
        setIsExecuting(false);
      }
    }
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isExecuting,
    result,
  };
};

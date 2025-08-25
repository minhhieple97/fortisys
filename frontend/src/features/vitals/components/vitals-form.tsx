'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSubmitVitals } from '../hooks/use-vitals-query';
import { CreateVitalsSchema, type CreateVitalsFormData } from '../schemas';
import { FormInputField } from './form-input-field';
import { FormSubmitButton } from './form-submit-button';
import { FormResultDisplay } from './form-result-display';
import { WORKER_ID } from '@/constants';

export const VitalsForm = () => {
  const form = useForm<CreateVitalsFormData>({
    resolver: zodResolver(CreateVitalsSchema),
    defaultValues: {
      workerId: WORKER_ID,
      heartRate: 0,
      temperature: 0,
    },
  });

  const { mutate: submitVitals, error, data: result } = useSubmitVitals();

  const onSubmit = (data: CreateVitalsFormData) => {
    submitVitals(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInputField
          form={form}
          name="workerId"
          label="Worker ID"
          type="text"
          placeholder="Enter worker ID (e.g., worker-123)"
          helperText="Format: letters, numbers, hyphens, underscores"
          inputProps={{
            disabled: true,
          }}
        />

        <FormInputField
          form={form}
          name="heartRate"
          label="Heart Rate (BPM)"
          type="number"
          placeholder="Enter heart rate (40-200 BPM)"
          min={40}
          max={200}
          step={1}
          helperText="Range: 40-200 BPM"
        />

        <FormInputField
          form={form}
          name="temperature"
          label="Temperature (°C)"
          type="number"
          placeholder="Enter temperature (35.0-42.0°C)"
          min={35.0}
          max={42.0}
          step={0.1}
          helperText="Range: 35.0-42.0°C"
        />

        <FormSubmitButton form={form} />
      </form>

      <FormResultDisplay result={result} error={error} form={form} />
    </div>
  );
};

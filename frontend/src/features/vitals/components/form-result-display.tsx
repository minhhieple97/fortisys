import type { VitalsResponse } from '../types';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateVitalsFormData } from '../schemas';

type FormResultDisplayProps = {
  result: VitalsResponse | undefined;
  error: Error | null;
  form: UseFormReturn<CreateVitalsFormData>;
};

export const FormResultDisplay = ({ result, error, form }: FormResultDisplayProps) => {
  const { isSubmitSuccessful, isSubmitting } = form.formState;

  if (result && isSubmitSuccessful) {
    return (
      <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800">
        <p className="text-sm font-medium">Success!</p>
        <p className="text-sm">{result.message}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to submit vitals data'}
        </p>
      </div>
    );
  }

  return null;
};

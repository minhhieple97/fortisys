import type { UseFormReturn } from 'react-hook-form';
import type { CreateVitalsFormData } from '../schemas';

type FormSubmitButtonProps = {
  form: UseFormReturn<CreateVitalsFormData>;
};

export const FormSubmitButton = ({ form }: FormSubmitButtonProps) => {
  const { isSubmitting, isValid } = form.formState;
  
  return (
    <button
      type="submit"
      disabled={isSubmitting || !isValid}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSubmitting ? 'Sending...' : 'Send Data'}
    </button>
  );
};

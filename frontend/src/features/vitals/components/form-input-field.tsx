import type { UseFormReturn } from 'react-hook-form';
import type { CreateVitalsFormData } from '../schemas';
import { InputHTMLAttributes } from 'react';

type FormInputFieldProps = {
  form: UseFormReturn<CreateVitalsFormData>;
  name: keyof CreateVitalsFormData;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export const FormInputField = ({
  form,
  name,
  label,
  type,
  placeholder,
  min,
  max,
  step,
  helperText,
  inputProps,
}: FormInputFieldProps) => {
  const error = form.formState.errors[name];

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...form.register(name, {
          valueAsNumber: type === 'number',
        })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        {...inputProps}
      />
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      {error && <p className="text-xs text-red-600">{error.message || 'Invalid input'}</p>}
    </div>
  );
};

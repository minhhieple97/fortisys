type VitalsErrorStateProps = {
  error: Error | unknown;
  onRetry: () => void;
};

export const VitalsErrorState = ({ error, onRetry }: VitalsErrorStateProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-800 text-sm">
        Error: {error instanceof Error ? error.message : 'Failed to fetch vitals'}
      </p>
      <button
        onClick={onRetry}
        className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
      >
        Retry
      </button>
    </div>
  );
};

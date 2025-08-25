'use client';

import { useVitalsQuery } from '../hooks/use-vitals-query';
import type { VitalsRecord } from '../types';
import { VitalsLoadingSkeleton } from './vitals-loading-skeleton';
import { VitalsErrorState } from './vitals-error-state';
import { VitalsEmptyState } from './vitals-empty-state';
import { VitalsList } from './vitals-list';
import { WORKER_ID } from '@/constants';

type VitalsDisplayProps = {
  initialVitals: VitalsRecord[];
};

export const VitalsDisplay = ({ initialVitals }: VitalsDisplayProps) => {
  const { data: vitals = initialVitals, isLoading, error, refetch } = useVitalsQuery(WORKER_ID);

  if (isLoading && initialVitals.length === 0) {
    return <VitalsLoadingSkeleton />;
  }

  if (error && initialVitals.length === 0) {
    return <VitalsErrorState error={error} onRetry={refetch} />;
  }

  if (vitals.length === 0) {
    return <VitalsEmptyState />;
  }

  return <VitalsList vitals={vitals} />;
};

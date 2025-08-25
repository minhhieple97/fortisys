import type { VitalsRecord } from '../types';
import { VitalCard } from './vital-card';

type VitalsListProps = {
  vitals: VitalsRecord[];
};

export const VitalsList = ({ vitals }: VitalsListProps) => {
  return (
    <div className="max-h-96 overflow-y-auto space-y-3 pr-2 border border-gray-100 rounded-md p-2">
      {vitals.map((vital) => (
        <VitalCard key={vital.id} vital={vital} />
      ))}
    </div>
  );
};

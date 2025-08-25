import type { VitalsRecord } from '../types';

type VitalCardProps = {
  vital: VitalsRecord;
};

export const VitalCard = ({ vital }: VitalCardProps) => {
  const timestamp = new Date(vital.timestamp);
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {timestamp.toLocaleDateString()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Heart Rate</p>
          <p className="text-lg font-semibold text-gray-900">
            {vital.heartRate} <span className="text-sm text-gray-500">BPM</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature</p>
          <p className="text-lg font-semibold text-gray-900">
            {vital.temperature} <span className="text-sm text-gray-500">°C</span>
          </p>
        </div>
      </div>
    </div>
  );
};

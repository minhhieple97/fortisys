import type { ReactNode } from 'react';

type DashboardSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export const DashboardSection = ({ title, children, className = '' }: DashboardSectionProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
};

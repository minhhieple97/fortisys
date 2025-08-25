import { Suspense } from 'react';
import { getRecentVitals } from '../queries/get-vitals';
import { VitalsForm } from './vitals-form';
import { VitalsDisplay } from './vitals-display';
import { DashboardHeader } from './dashboard-header';
import { DashboardSection } from './dashboard-section';
import { VitalsDisplaySkeleton } from './vitals-display-skeleton';
import { WORKER_ID } from '@/constants';

export const VitalsDashboard = async () => {
  const initialVitals = await getRecentVitals(WORKER_ID);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardSection title="Submit Vitals Data">
            <VitalsForm />
          </DashboardSection>

          <DashboardSection title="Recent Vitals Records" className="min-h-96">
            <Suspense fallback={<VitalsDisplaySkeleton />}>
              <VitalsDisplay initialVitals={initialVitals} />
            </Suspense>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

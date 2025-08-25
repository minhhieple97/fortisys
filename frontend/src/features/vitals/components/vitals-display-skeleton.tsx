export const VitalsDisplaySkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-16 bg-gray-200 rounded-md"></div>
      </div>
    ))}
  </div>
);

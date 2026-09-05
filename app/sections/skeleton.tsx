export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="bg-muted h-8 w-1/3 rounded" />
      <div className="space-y-2">
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-5/6 rounded" />
        <div className="bg-muted h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse space-y-4 rounded-lg border p-6">
          <div className="bg-muted h-6 w-1/2 rounded" />
          <div className="bg-muted h-8 w-1/3 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="bg-muted h-4 w-full rounded" />
            ))}
          </div>
          <div className="bg-muted h-10 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

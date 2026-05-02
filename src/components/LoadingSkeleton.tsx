function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-4 w-12 bg-gray-800 rounded" />
          <div className="h-4 w-14 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

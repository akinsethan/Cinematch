function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse border" style={{ background: "#1a1a1a", borderColor: "#2a2a2a" }}>
      <div className="aspect-[2/3]" style={{ background: "#222222" }} />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded w-3/4" style={{ background: "#222222" }} />
        <div className="h-3 rounded w-1/2" style={{ background: "#222222" }} />
        <div className="flex gap-1">
          <div className="h-4 w-12 rounded" style={{ background: "#222222" }} />
          <div className="h-4 w-14 rounded" style={{ background: "#222222" }} />
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

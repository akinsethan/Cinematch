interface Props { onReset: () => void; }

export function EmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-6xl">🎬</div>
      <h3 className="font-display text-2xl uppercase tracking-wider" style={{ color: "#f5f0e8" }}>
        No Movies Match Your Filters
      </h3>
      <p className="text-sm max-w-sm" style={{ color: "#6b6458" }}>
        Try adjusting your genre selection, maturity rating, decade, or minimum rating.
      </p>
      <button
        onClick={onReset}
        className="mt-2 px-6 py-2 font-display uppercase tracking-wider text-sm rounded cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: "#d4a42a", color: "#0a0a0a" }}
      >
        Reset Filters
      </button>
    </div>
  );
}

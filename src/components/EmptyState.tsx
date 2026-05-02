interface Props {
  onReset: () => void;
}

export function EmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-6xl">🎬</div>
      <h3 className="text-xl font-semibold text-white">No movies match your filters</h3>
      <p className="text-gray-400 text-sm max-w-sm">
        Try adjusting your genre selection, maturity rating, decade, or minimum
        rating to see results.
      </p>
      <button
        onClick={onReset}
        className="mt-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
      >
        Reset filters
      </button>
    </div>
  );
}

import type { ScoredMovie } from "../../types/movie";

interface Props {
  movie: ScoredMovie;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(value * 100, 100)}%` }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  weight,
  color,
}: {
  label: string;
  value: number;
  weight: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-gray-400 shrink-0">{label}</span>
      <Bar value={value} color={color} />
      <span className="w-10 text-right text-gray-300 shrink-0">
        {(value * 100).toFixed(0)}%
      </span>
      <span className="w-8 text-right text-gray-500 shrink-0 text-[10px]">
        ×{weight}
      </span>
    </div>
  );
}

export function ScoreBreakdown({ movie }: Props) {
  const { scoreBreakdown, compositeScore } = movie;
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs font-semibold text-gray-300 mb-1">
        Composite Score:{" "}
        <span className="text-violet-400">{(compositeScore * 100).toFixed(1)}</span>
      </p>
      <Row
        label="Rating"
        value={scoreBreakdown.normalizedRating}
        weight="0.40"
        color="bg-emerald-500"
      />
      <Row
        label="Popularity"
        value={scoreBreakdown.normalizedPopularity}
        weight="0.25"
        color="bg-blue-500"
      />
      <Row
        label="Genre Match"
        value={scoreBreakdown.genreMatchScore}
        weight="0.25"
        color="bg-violet-500"
      />
      <Row
        label="Recency"
        value={Math.max(0, scoreBreakdown.recencyScore)}
        weight="0.10"
        color="bg-orange-500"
      />
    </div>
  );
}

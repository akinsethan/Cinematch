import type { ScoredMovie } from "../../types/movie";

interface Props { movie: ScoredMovie; }

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: "#2a2a2a" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(value * 100, 100)}%`, background: color }} />
    </div>
  );
}

function Row({ label, value, weight, color }: { label: string; value: number; weight: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0" style={{ color: "#6b6458" }}>{label}</span>
      <Bar value={value} color={color} />
      <span className="w-10 text-right shrink-0" style={{ color: "#b5a898" }}>{(value * 100).toFixed(0)}%</span>
      <span className="w-8 text-right shrink-0 text-[10px]" style={{ color: "#3a3530" }}>×{weight}</span>
    </div>
  );
}

export function ScoreBreakdown({ movie }: Props) {
  const { scoreBreakdown, compositeScore } = movie;
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs font-display uppercase tracking-wide mb-1" style={{ color: "#6b6458" }}>
        Score:{" "}
        <span style={{ color: "#d4a42a" }}>{(compositeScore * 100).toFixed(1)}</span>
      </p>
      <Row label="Rating"      value={scoreBreakdown.normalizedRating}    weight="0.40" color="#d4a42a" />
      <Row label="Popularity"  value={scoreBreakdown.normalizedPopularity} weight="0.25" color="#4a8b8c" />
      <Row label="Genre Match" value={scoreBreakdown.genreMatchScore}      weight="0.25" color="#e06830" />
      <Row label="Recency"     value={Math.max(0, scoreBreakdown.recencyScore)} weight="0.10" color="#b5336a" />
    </div>
  );
}

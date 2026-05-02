export function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 7.5
      ? "text-emerald-300"
      : rating >= 6
      ? "text-yellow-300"
      : "text-red-400";

  return (
    <span className={`font-bold text-sm ${color}`}>
      ★ {rating.toFixed(1)}
    </span>
  );
}

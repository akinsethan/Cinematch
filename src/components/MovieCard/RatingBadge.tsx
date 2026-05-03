export function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="font-bold text-sm" style={{ color: "#d4a42a" }}>
      ★ {rating.toFixed(1)}
    </span>
  );
}

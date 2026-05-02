import type { MaturityRating } from "../../types/movie";

const STYLES: Record<MaturityRating, string> = {
  Family: "bg-green-800/80 text-green-200 border-green-700",
  Teen: "bg-yellow-800/80 text-yellow-200 border-yellow-700",
  Mature: "bg-red-900/80 text-red-200 border-red-800",
};

const LABELS: Record<MaturityRating, string> = {
  Family: "Family",
  Teen: "Teen",
  Mature: "Mature",
};

export function MaturityBadge({ maturity }: { maturity: MaturityRating }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STYLES[maturity]}`}
    >
      {LABELS[maturity]}
    </span>
  );
}

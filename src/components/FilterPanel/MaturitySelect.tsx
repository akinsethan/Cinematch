import type { MaturityFilter } from "../../types/movie";

const OPTIONS: MaturityFilter[] = ["All", "Family", "Teen", "Mature"];

interface Props {
  value: MaturityFilter;
  onChange: (v: MaturityFilter) => void;
}

const BADGE_STYLES: Record<MaturityFilter, string> = {
  All: "bg-gray-700 border-gray-600 text-gray-300",
  Family: "bg-green-800 border-green-600 text-green-200",
  Teen: "bg-yellow-800 border-yellow-600 text-yellow-200",
  Mature: "bg-red-900 border-red-700 text-red-200",
};

const ACTIVE_STYLES: Record<MaturityFilter, string> = {
  All: "bg-gray-500 border-gray-400 text-white",
  Family: "bg-green-600 border-green-400 text-white",
  Teen: "bg-yellow-600 border-yellow-400 text-white",
  Mature: "bg-red-700 border-red-500 text-white",
};

export function MaturitySelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Maturity
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              value === opt ? ACTIVE_STYLES[opt] : BADGE_STYLES[opt]
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

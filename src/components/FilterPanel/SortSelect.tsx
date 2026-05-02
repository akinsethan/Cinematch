import type { SortBy } from "../../types/movie";

const OPTIONS: SortBy[] = ["Composite Score", "Rating", "Popularity", "Release Year"];

interface Props {
  value: SortBy;
  onChange: (v: SortBy) => void;
}

export function SortSelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Sort By
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortBy)}
        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

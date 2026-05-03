import type { SortBy } from "../../types/movie";

const OPTIONS: SortBy[] = ["Composite Score", "Rating", "Popularity", "Release Year"];

interface Props {
  value: SortBy;
  onChange: (v: SortBy) => void;
}

export function SortSelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-2" style={{ color: "#6b6458" }}>
        Sort By
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortBy)}
        className="text-sm rounded-lg px-3 py-2 w-full focus:outline-none cursor-pointer"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          color: "#f5f0e8",
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt} style={{ background: "#1a1a1a" }}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

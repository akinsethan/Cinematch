import type { MaturityFilter } from "../../types/movie";

const OPTIONS: MaturityFilter[] = ["All", "Family", "Teen", "Mature"];

interface Props {
  value: MaturityFilter;
  onChange: (v: MaturityFilter) => void;
}

const ACTIVE_COLOR: Record<MaturityFilter, string> = {
  All:    "#4a8b8c",
  Family: "#4a8b8c",
  Teen:   "#d4a42a",
  Mature: "#c0392b",
};

export function MaturitySelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-2" style={{ color: "#6b6458" }}>
        Maturity
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => {
          const active = value === opt;
          const color = ACTIVE_COLOR[opt];
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="px-3 py-1 rounded-full text-xs font-display uppercase tracking-wide border transition-all cursor-pointer"
              style={{
                background: active ? color : "#1a1a1a",
                borderColor: active ? color : "#2a2a2a",
                color: active ? "#0a0a0a" : "#6b6458",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

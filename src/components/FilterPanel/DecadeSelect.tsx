import type { DecadeFilter } from "../../types/movie";

const OPTIONS: DecadeFilter[] = ["All", "1980s", "1990s", "2000s", "2010s", "2020s"];

interface Props {
  value: DecadeFilter;
  onChange: (v: DecadeFilter) => void;
}

export function DecadeSelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-2" style={{ color: "#6b6458" }}>
        Decade
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="px-3 py-1 rounded-full text-xs font-display uppercase tracking-wide border transition-all cursor-pointer"
              style={{
                background: active ? "#4a8b8c" : "#1a1a1a",
                borderColor: active ? "#4a8b8c" : "#2a2a2a",
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

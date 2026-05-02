import type { DecadeFilter } from "../../types/movie";

const OPTIONS: DecadeFilter[] = ["All", "1980s", "1990s", "2000s", "2010s", "2020s"];

interface Props {
  value: DecadeFilter;
  onChange: (v: DecadeFilter) => void;
}

export function DecadeSelect({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Decade
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              value === opt
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-500 hover:text-violet-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

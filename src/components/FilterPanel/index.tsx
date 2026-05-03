import type { Filters } from "../../types/movie";
import { DEFAULT_FILTERS } from "../../types/movie";
import { MoodSelector } from "./MoodSelector";
import { GenreMultiSelect } from "./GenreMultiSelect";
import { MaturitySelect } from "./MaturitySelect";
import { DecadeSelect } from "./DecadeSelect";
import { RatingSlider } from "./RatingSlider";
import { SortSelect } from "./SortSelect";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  resultCount: number;
  isLoading: boolean;
}

export function FilterPanel({ filters, onChange, resultCount, isLoading }: Props) {
  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.maturity !== "All" ||
    filters.decade !== "All" ||
    filters.minRating > 0;

  return (
    <aside
      className="w-full lg:w-72 shrink-0 rounded-2xl p-5 space-y-6 self-start lg:sticky lg:top-[88px] border"
      style={{ background: "#111111", borderColor: "#2a2a2a" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg uppercase tracking-widest text-cm-cream">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs uppercase tracking-widest font-display transition-colors cursor-pointer"
            style={{ color: "#d4a42a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8b84a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#d4a42a")}
          >
            Reset All
          </button>
        )}
      </div>

      <MoodSelector filters={filters} onChange={onChange} />

      <div className="brand-stripe rounded-full" />

      <GenreMultiSelect selected={filters.genres} onChange={(genres) => onChange({ genres })} />
      <MaturitySelect value={filters.maturity} onChange={(maturity) => onChange({ maturity })} />
      <DecadeSelect value={filters.decade} onChange={(decade) => onChange({ decade })} />
      <RatingSlider value={filters.minRating} onChange={(minRating) => onChange({ minRating })} />
      <SortSelect value={filters.sortBy} onChange={(sortBy) => onChange({ sortBy })} />

      {/* Result count */}
      <div className="text-center text-sm pt-2 border-t" style={{ borderColor: "#2a2a2a", color: "#6b6458" }}>
        {isLoading ? (
          <span className="animate-pulse">Loading…</span>
        ) : (
          <span>
            <span className="font-bold" style={{ color: "#d4a42a" }}>{resultCount}</span>{" "}
            {resultCount === 1 ? "movie" : "movies"} found
          </span>
        )}
      </div>
    </aside>
  );
}

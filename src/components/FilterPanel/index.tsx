import type { Filters } from "../../types/movie";
import { DEFAULT_FILTERS } from "../../types/movie";
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
    <aside className="w-full lg:w-72 shrink-0 bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-6 self-start lg:sticky lg:top-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      <GenreMultiSelect
        selected={filters.genres}
        onChange={(genres) => onChange({ genres })}
      />

      <MaturitySelect
        value={filters.maturity}
        onChange={(maturity) => onChange({ maturity })}
      />

      <DecadeSelect
        value={filters.decade}
        onChange={(decade) => onChange({ decade })}
      />

      <RatingSlider
        value={filters.minRating}
        onChange={(minRating) => onChange({ minRating })}
      />

      <SortSelect
        value={filters.sortBy}
        onChange={(sortBy) => onChange({ sortBy })}
      />

      {/* Result count */}
      <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-800">
        {isLoading ? (
          <span className="animate-pulse">Loading…</span>
        ) : (
          <span>
            <span className="text-violet-400 font-semibold">{resultCount}</span>{" "}
            {resultCount === 1 ? "movie" : "movies"} found
          </span>
        )}
      </div>
    </aside>
  );
}

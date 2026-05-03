import type { ScoredMovie, Filters } from "../types/movie";

const DECADE_RANGES: Record<string, [number, number]> = {
  "1980s": [1980, 1989],
  "1990s": [1990, 1999],
  "2000s": [2000, 2009],
  "2010s": [2010, 2019],
  "2020s": [2020, 2029],
};

export function applyClientFilters(
  movies: ScoredMovie[],
  filters: Filters
): ScoredMovie[] {
  let result = movies;

  if (filters.maturity !== "All") {
    result = result.filter((m) => m.maturity === filters.maturity);
  }

  if (filters.decade !== "All") {
    const range = DECADE_RANGES[filters.decade];
    if (range) {
      result = result.filter(
        (m) => m.release_year >= range[0] && m.release_year <= range[1]
      );
    }
  }

  if (filters.minRating > 0) {
    result = result.filter((m) => m.rating >= filters.minRating);
  }

  // Sort
  switch (filters.sortBy) {
    case "Rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    case "Popularity":
      result = [...result].sort((a, b) => b.popularity - a.popularity);
      break;
    case "Release Year":
      result = [...result].sort((a, b) => b.release_year - a.release_year);
      break;
    case "Composite Score":
    default:
      result = [...result].sort((a, b) => b.compositeScore - a.compositeScore);
      break;
  }

  return result;
}

export function decadeToRange(decade: string): [number, number] | null {
  return DECADE_RANGES[decade] ?? null;
}

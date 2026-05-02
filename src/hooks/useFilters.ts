import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Filters, Genre, MaturityFilter, DecadeFilter, SortBy } from "../types/movie";
import { DEFAULT_FILTERS, GENRE_LIST } from "../types/movie";

function parseGenres(raw: string | null): Genre[] {
  if (!raw) return [];
  return raw
    .split(",")
    .filter((g): g is Genre => GENRE_LIST.includes(g as Genre));
}

function parseMaturity(raw: string | null): MaturityFilter {
  const valid: MaturityFilter[] = ["All", "Family", "Teen", "Mature"];
  return valid.includes(raw as MaturityFilter)
    ? (raw as MaturityFilter)
    : DEFAULT_FILTERS.maturity;
}

function parseDecade(raw: string | null): DecadeFilter {
  const valid: DecadeFilter[] = ["All", "1980s", "1990s", "2000s", "2010s", "2020s"];
  return valid.includes(raw as DecadeFilter)
    ? (raw as DecadeFilter)
    : DEFAULT_FILTERS.decade;
}

function parseSortBy(raw: string | null): SortBy {
  const valid: SortBy[] = ["Composite Score", "Rating", "Popularity", "Release Year"];
  return valid.includes(raw as SortBy)
    ? (raw as SortBy)
    : DEFAULT_FILTERS.sortBy;
}

function parseMinRating(raw: string | null): number {
  const n = raw !== null ? parseFloat(raw) : NaN;
  if (isNaN(n) || n < 0 || n > 9) return DEFAULT_FILTERS.minRating;
  return Math.round(n * 2) / 2; // snap to 0.5 increments
}

export function useFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filters = useMemo(
    () => ({
      genres: parseGenres(searchParams.get("genres")),
      maturity: parseMaturity(searchParams.get("maturity")),
      decade: parseDecade(searchParams.get("decade")),
      minRating: parseMinRating(searchParams.get("minRating")),
      sortBy: parseSortBy(searchParams.get("sortBy")),
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const merged: Filters = { ...filters, ...patch };

          if (merged.genres.length > 0) {
            next.set("genres", merged.genres.join(","));
          } else {
            next.delete("genres");
          }

          if (merged.maturity !== "All") {
            next.set("maturity", merged.maturity);
          } else {
            next.delete("maturity");
          }

          if (merged.decade !== "All") {
            next.set("decade", merged.decade);
          } else {
            next.delete("decade");
          }

          if (merged.minRating > 0) {
            next.set("minRating", String(merged.minRating));
          } else {
            next.delete("minRating");
          }

          if (merged.sortBy !== "Composite Score") {
            next.set("sortBy", merged.sortBy);
          } else {
            next.delete("sortBy");
          }

          return next;
        },
        { replace: true }
      );
    },
    [filters, setSearchParams]
  );

  return [filters, setFilters];
}

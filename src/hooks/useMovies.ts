import { useState, useEffect, useRef } from "react";
import type { ScoredMovie, Filters } from "../types/movie";
import { GENRE_TO_TMDB_ID } from "../types/movie";
import { discoverMovies, type DiscoverParams } from "../api/tmdb";
import { rankMovies } from "../utils/scoring";
import { applyClientFilters, decadeToRange } from "../utils/filters";

export interface UseMoviesResult {
  movies: ScoredMovie[];
  isLoading: boolean;
  error: string | null;
}

function buildDiscoverParams(filters: Filters): DiscoverParams {
  const params: DiscoverParams = {};

  if (filters.genres.length > 0) {
    params.genreIds = filters.genres.map((g) => GENRE_TO_TMDB_ID[g]);
  }

  const range = filters.decade !== "All" ? decadeToRange(filters.decade) : null;
  if (range) {
    params.decadeStart = range[0];
    params.decadeEnd = range[1];
  }

  if (filters.minRating > 0) {
    params.minRating = filters.minRating;
  }

  return params;
}

// Stable key — only changes for server-side params (genres/decade/minRating).
// Sort and maturity are client-side only and must not trigger a re-fetch.
function discoverKey(params: DiscoverParams): string {
  return JSON.stringify({
    genreIds: params.genreIds?.slice().sort(),
    decadeStart: params.decadeStart,
    decadeEnd: params.decadeEnd,
    minRating: params.minRating,
  });
}

export function useMovies(filters: Filters): UseMoviesResult {
  const [movies, setMovies] = useState<ScoredMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache ranked results per discover-key so client-side filter changes
  // (sort, maturity) are instant without a network round-trip.
  const cache = useRef<Map<string, ScoredMovie[]>>(new Map());
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const params = buildDiscoverParams(filters);
    const key = discoverKey(params);

    if (cache.current.has(key)) {
      setMovies(applyClientFilters(cache.current.get(key)!, filters));
      setIsLoading(false);
      return;
    }

    if (key !== lastKeyRef.current) {
      setIsLoading(true);
      setError(null);
      lastKeyRef.current = key;
    }

    let cancelled = false;

    discoverMovies(params)
      .then((raw) => {
        if (cancelled) return;
        const ranked = rankMovies(raw, filters.genres);
        cache.current.set(key, ranked);
        setMovies(applyClientFilters(ranked, filters));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[useMovies] fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load movies.");
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters]);

  return { movies, isLoading, error };
}

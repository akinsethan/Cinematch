import { useState, useEffect, useRef } from "react";
import type { ScoredMovie, Filters } from "../types/movie";
import { GENRE_TO_TMDB_ID } from "../types/movie";
import { discoverMovies, type DiscoverParams } from "../api/tmdb";
import { rankMovies } from "../utils/scoring";
import { applyClientFilters } from "../utils/filters";
import { decadeToRange } from "../utils/filters";

interface UseMoviesResult {
  movies: ScoredMovie[];
  isLoading: boolean;
  error: string | null;
}

// Build TMDB discover params from active filters (server-side filtering)
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

// Stable key to avoid redundant fetches when only sort/maturity change
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

  // Cache raw movies per discover key so client-side filter changes are instant
  const rawCache = useRef<Map<string, ReturnType<typeof rankMovies>>>(new Map());
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const discoverParams = buildDiscoverParams(filters);
    const key = discoverKey(discoverParams);

    // If we have a cached raw result for this key, skip fetching
    if (rawCache.current.has(key)) {
      const ranked = rawCache.current.get(key)!;
      const filtered = applyClientFilters(ranked, filters);
      setMovies(filtered);
      setIsLoading(false);
      return;
    }

    // Only show loading spinner when the discover params actually change
    if (key !== lastKeyRef.current) {
      setIsLoading(true);
      setError(null);
      lastKeyRef.current = key;
    }

    let cancelled = false;

    discoverMovies(discoverParams)
      .then((raw) => {
        if (cancelled) return;
        const ranked = rankMovies(raw, filters.genres);
        rawCache.current.set(key, ranked);
        const filtered = applyClientFilters(ranked, filters);
        setMovies(filtered);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[useMovies] fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load movies."
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return { movies, isLoading, error };
}

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Movie, ScoredMovie, Filters } from "../types/movie";
import { GENRE_TO_TMDB_ID } from "../types/movie";
import { discoverMovies, type DiscoverParams } from "../api/tmdb";
import { rankMovies } from "../utils/scoring";
import { applyClientFilters, decadeToRange } from "../utils/filters";

export interface UseMoviesResult {
  movies: ScoredMovie[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
  loadMore: () => void;
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

// Stable string key — only changes when server-side params change.
// Sort/maturity changes are client-side only and must NOT trigger a re-fetch.
function discoverKey(params: DiscoverParams): string {
  return JSON.stringify({
    genreIds: params.genreIds?.slice().sort(),
    decadeStart: params.decadeStart,
    decadeEnd: params.decadeEnd,
    minRating: params.minRating,
  });
}

export function useMovies(filters: Filters): UseMoviesResult {
  // Raw accumulated movies for the current filter key (all pages fetched so far)
  const [rawMovies, setRawMovies] = useState<Movie[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which key was last fetched so loadMore uses the right params
  const activeKeyRef = useRef<string>("");
  const activeParamsRef = useRef<DiscoverParams>({});

  const discoverParams = buildDiscoverParams(filters);
  const key = discoverKey(discoverParams);

  // Re-fetch from page 0 whenever server-side filter params change
  useEffect(() => {
    if (key === activeKeyRef.current) return; // sort/maturity only — skip

    activeKeyRef.current = key;
    activeParamsRef.current = discoverParams;

    setIsLoading(true);
    setError(null);
    setRawMovies([]);
    setHasMore(false);
    setTotalResults(0);
    setNextPage(1);

    let cancelled = false;

    discoverMovies({ ...discoverParams, page: 0 })
      .then(({ movies: raw, hasMore: more, totalResults: total }) => {
        if (cancelled) return;
        setRawMovies(raw);
        setHasMore(more);
        setTotalResults(total);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[useMovies] fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load movies.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Derive displayed movies: rank ALL accumulated raw movies, then apply
  // client-side filters. Recomputes instantly when sort/maturity changes
  // without any network request.
  const movies = useMemo(() => {
    const ranked = rankMovies(rawMovies, filters.genres);
    return applyClientFilters(ranked, filters);
  }, [rawMovies, filters]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const { movies: newRaw, hasMore: more, totalResults: total } =
        await discoverMovies({ ...activeParamsRef.current, page: nextPage });

      setRawMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...newRaw.filter((m) => !seen.has(m.id))];
      });
      setHasMore(more);
      setTotalResults(total);
      setNextPage((p) => p + 1);
    } catch (err) {
      // Load-more errors are non-fatal — existing results stay visible
      console.error("[useMovies] loadMore error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextPage]);

  return { movies, isLoading, isLoadingMore, error, hasMore, totalResults, loadMore };
}

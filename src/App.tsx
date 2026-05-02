import { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useFilters } from "./hooks/useFilters";
import { useMovies } from "./hooks/useMovies";
import { FilterPanel } from "./components/FilterPanel";
import { MovieGrid } from "./components/MovieGrid";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ComparePanel } from "./components/ComparePanel";
import { WatchlistPanel } from "./components/WatchlistPanel";
import type { ScoredMovie } from "./types/movie";
import { DEFAULT_FILTERS } from "./types/movie";

const WATCHLIST_KEY = "cinematch_watchlist";

function loadWatchlist(): ScoredMovie[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as ScoredMovie[]) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(list: ScoredMovie[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

// ---------------------------------------------------------------------------
// Inner app (needs router context for useSearchParams)
// ---------------------------------------------------------------------------

function AppInner() {
  const [filters, setFilters] = useFilters();
  const { movies, isLoading, error } = useMovies(filters);

  // Watchlist
  const [watchlist, setWatchlist] = useState<ScoredMovie[]>(loadWatchlist);
  const watchlistIds = new Set(watchlist.map((m) => m.id));

  const toggleWatchlist = useCallback((movie: ScoredMovie) => {
    setWatchlist((prev) => {
      const next = prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: number) => {
    setWatchlist((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveWatchlist(next);
      return next;
    });
  }, []);

  // Compare (max 2)
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const toggleCompare = useCallback((movie: ScoredMovie) => {
    setCompareIds((prev) => {
      if (prev.includes(movie.id)) return prev.filter((id) => id !== movie.id);
      if (prev.length >= 2) return prev;
      return [...prev, movie.id];
    });
  }, []);

  const compareMovies =
    compareIds.length === 2
      ? (compareIds.map((id) => movies.find((m) => m.id === id)).filter(Boolean) as ScoredMovie[])
      : null;

  // "Surprise Me" — random pick from top 10
  const [surpriseMovie, setSurpriseMovie] = useState<ScoredMovie | null>(null);

  const surpriseMe = useCallback(() => {
    if (movies.length === 0) return;
    const pool = movies.slice(0, Math.min(10, movies.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseMovie(pick);
  }, [movies]);

  // Close surprise overlay on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSurpriseMovie(null);
        setCompareIds([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">
                CineMatch
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Powered by TMDB</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && movies.length > 0 && (
              <button
                onClick={surpriseMe}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg cursor-pointer"
              >
                <span>🎲</span>
                Surprise Me
              </button>
            )}
            {compareIds.length > 0 && (
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                Clear compare ({compareIds.length}/2)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          resultCount={movies.length}
          isLoading={isLoading}
        />

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm">
              <strong>Error:</strong> {error}
              {!import.meta.env.VITE_TMDB_API_KEY && (
                <p className="mt-1 text-red-400">
                  No API key found. Set <code className="bg-red-900/50 px-1 rounded">VITE_TMDB_API_KEY</code> in your <code className="bg-red-900/50 px-1 rounded">.env</code> file.
                </p>
              )}
            </div>
          )}

          {isLoading ? (
            <LoadingSkeleton count={15} />
          ) : movies.length === 0 ? (
            <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <>
              {/* Active compare hint */}
              {compareIds.length === 1 && (
                <div className="mb-4 p-3 bg-violet-900/20 border border-violet-800/50 rounded-xl text-violet-300 text-sm">
                  Select one more movie to compare side by side.
                </div>
              )}
              <MovieGrid
                movies={movies}
                watchlist={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            </>
          )}
        </div>
      </main>

      {/* Watchlist drawer */}
      <WatchlistPanel watchlist={watchlist} onRemove={removeFromWatchlist} />

      {/* Compare modal */}
      {compareMovies && compareMovies.length === 2 && (
        <ComparePanel
          movies={compareMovies as [ScoredMovie, ScoredMovie]}
          onClose={() => setCompareIds([])}
        />
      )}

      {/* Surprise Me modal */}
      {surpriseMovie && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSurpriseMovie(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-bold">🎲 Your Pick</h2>
              <button
                onClick={() => setSurpriseMovie(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {surpriseMovie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${surpriseMovie.poster_path}`}
                alt={surpriseMovie.title}
                className="w-full aspect-[16/9] object-cover object-top"
              />
            )}
            <div className="p-5 space-y-2">
              <h3 className="text-xl font-bold text-white">{surpriseMovie.title}</h3>
              <p className="text-sm text-gray-400">
                {surpriseMovie.release_year} · ★ {surpriseMovie.rating.toFixed(1)} ·{" "}
                {surpriseMovie.maturity}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                {surpriseMovie.overview}
              </p>
              <button
                onClick={() => {
                  setSurpriseMovie(null);
                  surpriseMe();
                }}
                className="w-full mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Try another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

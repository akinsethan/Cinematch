import { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useFilters } from "./hooks/useFilters";
import { useMovies } from "./hooks/useMovies";
import { FilterPanel } from "./components/FilterPanel";
import { MovieGrid } from "./components/MovieGrid";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ComparePanel } from "./components/ComparePanel";
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

type Tab = "discover" | "watchlist";

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [filters, setFilters] = useFilters();
  const { movies, isLoading, error } = useMovies(filters);

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

  const [compareIds, setCompareIds] = useState<number[]>([]);

  const toggleCompare = useCallback((movie: ScoredMovie) => {
    setCompareIds((prev) => {
      if (prev.includes(movie.id)) return prev.filter((id) => id !== movie.id);
      if (prev.length >= 2) return prev;
      return [...prev, movie.id];
    });
  }, []);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setCompareIds([]);
  }, []);

  const activePool = activeTab === "watchlist" ? watchlist : movies;
  const compareMovies =
    compareIds.length === 2
      ? (compareIds.map((id) => activePool.find((m) => m.id === id)).filter(Boolean) as ScoredMovie[])
      : null;

  const [surpriseMovie, setSurpriseMovie] = useState<ScoredMovie | null>(null);

  const surpriseMe = useCallback(() => {
    if (movies.length === 0) return;
    const pool = movies.slice(0, Math.min(10, movies.length));
    setSurpriseMovie(pool[Math.floor(Math.random() * pool.length)]);
  }, [movies]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSurpriseMovie(null); setCompareIds([]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-cm-bg text-cm-cream">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-cm-bg/95 backdrop-blur-sm border-b border-cm-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🎬</span>
            <div>
              <h1 className="font-display text-2xl uppercase leading-none tracking-wider">
                <span style={{ color: "#4a8b8c" }}>CINE</span>
                <span
                  style={{
                    background: "linear-gradient(to right, #e06830, #b5336a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  MATCH
                </span>
              </h1>
              <p className="text-[10px] text-cm-muted tracking-widest uppercase mt-0.5">
                Powered by TMDB
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            {activeTab === "discover" && !isLoading && movies.length > 0 && (
              <button
                onClick={surpriseMe}
                className="flex items-center gap-2 px-4 py-2 font-display uppercase tracking-wider text-sm text-cm-bg rounded cursor-pointer transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(to right, #e06830, #c0392b)" }}
              >
                🎲 Surprise Me
              </button>
            )}
            {compareIds.length > 0 && (
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-cm-muted hover:text-cm-cream transition-colors cursor-pointer tracking-wide"
              >
                Clear compare ({compareIds.length}/2)
              </button>
            )}
          </div>
        </div>

        {/* Rainbow stripe */}
        <div className="brand-stripe" />

        {/* Tab bar */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex">
          <TabButton active={activeTab === "discover"} onClick={() => switchTab("discover")}>
            Discover
          </TabButton>
          <TabButton
            active={activeTab === "watchlist"}
            onClick={() => switchTab("watchlist")}
            badge={watchlist.length > 0 ? watchlist.length : undefined}
          >
            🔖 My Watchlist
          </TabButton>
        </div>
      </header>

      {/* ── Discover tab ── */}
      {activeTab === "discover" && (
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            resultCount={movies.length}
            isLoading={isLoading}
          />

          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 p-4 rounded-xl text-sm border"
                style={{ background: "#1a0a0a", borderColor: "#c0392b", color: "#f5a0a0" }}>
                <strong>Error:</strong> {error}
                {!import.meta.env.VITE_TMDB_API_KEY && (
                  <p className="mt-1" style={{ color: "#e06830" }}>
                    Set <code className="px-1 rounded" style={{ background: "#2a1010" }}>VITE_TMDB_API_KEY</code> in your .env file.
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
                {compareIds.length === 1 && (
                  <div className="mb-4 p-3 rounded-xl text-sm border"
                    style={{ background: "#0a1a1a", borderColor: "#4a8b8c", color: "#7ac5c6" }}>
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
      )}

      {/* ── Watchlist tab ── */}
      {activeTab === "watchlist" && (
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
          {watchlist.length === 0 ? (
            <WatchlistEmptyState onDiscover={() => switchTab("discover")} />
          ) : (
            <>
              {compareIds.length === 1 && (
                <div className="mb-4 p-3 rounded-xl text-sm border"
                  style={{ background: "#0a1a1a", borderColor: "#4a8b8c", color: "#7ac5c6" }}>
                  Select one more movie to compare side by side.
                </div>
              )}
              <MovieGrid
                movies={watchlist}
                watchlist={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            </>
          )}
        </main>
      )}

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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSurpriseMovie(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border"
            style={{ background: "#1a1a1a", borderColor: "#3a3028" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* stripe top */}
            <div className="brand-stripe" />
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#2a2a2a" }}>
              <h2 className="font-display uppercase tracking-wider text-cm-gold">
                🎲 Your Pick
              </h2>
              <button onClick={() => setSurpriseMovie(null)} className="text-cm-muted hover:text-cm-cream cursor-pointer">✕</button>
            </div>
            {surpriseMovie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${surpriseMovie.poster_path}`}
                alt={surpriseMovie.title}
                className="w-full aspect-[16/9] object-cover object-top"
              />
            )}
            <div className="p-5 space-y-2">
              <h3 className="font-display text-xl uppercase tracking-wide text-cm-cream">
                {surpriseMovie.title}
              </h3>
              <p className="text-sm text-cm-muted">
                {surpriseMovie.release_year} · ★ {surpriseMovie.rating.toFixed(1)} · {surpriseMovie.maturity}
              </p>
              <p className="text-sm leading-relaxed line-clamp-4" style={{ color: "#b5a898" }}>
                {surpriseMovie.overview}
              </p>
              <button
                onClick={() => { setSurpriseMovie(null); surpriseMe(); }}
                className="w-full mt-3 px-4 py-2 font-display uppercase tracking-wider text-sm text-cm-bg rounded transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: "linear-gradient(to right, #e06830, #b5336a)" }}
              >
                Try Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab button ──
function TabButton({
  active, onClick, badge, children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-3 font-display uppercase tracking-wider text-sm transition-colors cursor-pointer border-b-2"
      style={{
        borderBottomColor: active ? "#d4a42a" : "transparent",
        color: active ? "#d4a42a" : "#6b6458",
      }}
    >
      {children}
      {badge !== undefined && (
        <span
          className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold leading-none text-cm-bg"
          style={{ background: "#d4a42a" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Watchlist empty state ──
function WatchlistEmptyState({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-6xl">🔖</div>
      <h3 className="font-display text-2xl uppercase tracking-wider text-cm-cream">
        No Movies Saved Yet
      </h3>
      <p className="text-cm-muted text-sm max-w-sm">
        Click the bookmark icon on any movie card to save it here for later.
      </p>
      <button
        onClick={onDiscover}
        className="mt-2 px-6 py-2 font-display uppercase tracking-wider text-sm text-cm-bg rounded cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: "#d4a42a" }}
      >
        Browse Movies
      </button>
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

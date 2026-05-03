import { useState, useCallback } from "react";
import type { ScoredMovie } from "../../types/movie";
import { POSTER_BASE_URL, getTrailerKey } from "../../api/tmdb";
import { MaturityBadge } from "./MaturityBadge";
import { RatingBadge } from "./RatingBadge";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { StreamingBadges } from "./StreamingBadges";
import { WatchlistButton } from "../WatchlistButton";
import { TrailerModal } from "../TrailerModal";
import { Toast } from "../Toast";

interface Props {
  movie: ScoredMovie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: ScoredMovie) => void;
  isSelected: boolean;
  onToggleCompare: (movie: ScoredMovie) => void;
  compareDisabled: boolean;
}

export function MovieCard({
  movie, isInWatchlist, onToggleWatchlist,
  isSelected, onToggleCompare, compareDisabled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleTrailerClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trailerLoading) return;
    setTrailerLoading(true);
    try {
      const key = await getTrailerKey(movie.id);
      if (key) setTrailerKey(key);
      else setShowToast(true);
    } finally {
      setTrailerLoading(false);
    }
  }, [movie.id, trailerLoading]);

  const posterUrl = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null;

  return (
    <article
      className="relative group flex flex-col rounded-xl overflow-hidden border transition-all duration-200"
      style={{
        background: "#1a1a1a",
        borderColor: isSelected ? "#4a8b8c" : "#2a2a2a",
        boxShadow: isSelected ? "0 0 0 1px #4a8b8c60" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = "#d4a42a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isSelected ? "#4a8b8c" : "#2a2a2a";
      }}
    >
      {/* Poster */}
      <div
        className="relative aspect-[2/3] overflow-hidden cursor-pointer"
        style={{ background: "#111111" }}
        onClick={() => setExpanded((e) => !e)}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "#3a3028" }}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <span className="text-xs font-display uppercase tracking-widest" style={{ color: "#f5f0e8" }}>
            {expanded ? "Hide Details" : "Show Details"}
          </span>
        </div>

        {/* Composite score badge — gold */}
        <div
          className="absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-display font-bold"
          style={{ background: "#d4a42a", color: "#0a0a0a" }}
        >
          {(movie.compositeScore * 100).toFixed(0)}
        </div>

        {/* Watchlist button */}
        <div className="absolute top-2 right-2">
          <WatchlistButton
            inWatchlist={isInWatchlist}
            onClick={(e) => { e.stopPropagation(); onToggleWatchlist(movie); }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3
          className="font-display uppercase tracking-wide text-sm leading-tight line-clamp-2 cursor-pointer"
          style={{ color: "#f5f0e8" }}
          onClick={() => setExpanded((e) => !e)}
        >
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <RatingBadge rating={movie.rating} />
          <span className="text-xs" style={{ color: "#6b6458" }}>{movie.release_year}</span>
          <MaturityBadge maturity={movie.maturity} />
        </div>

        {movie.genres.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] px-1.5 py-0.5 rounded font-display uppercase tracking-wide"
                style={{ background: "#111111", color: "#6b6458", border: "1px solid #2a2a2a" }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Bottom action row */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
          <button
            onClick={handleTrailerClick}
            disabled={trailerLoading}
            className="flex items-center gap-1 text-xs font-display uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: "#e06830" }}
          >
            {trailerLoading ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
            Trailer
          </button>

          <button
            onClick={() => onToggleCompare(movie)}
            disabled={compareDisabled && !isSelected}
            className="text-xs font-display uppercase tracking-wide transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: isSelected ? "#4a8b8c" : "#6b6458" }}
          >
            {isSelected ? "✓ Comparing" : "+ Compare"}
          </button>
        </div>
      </div>

      {/* Expandable section */}
      {expanded && (
        <div className="border-t" style={{ background: "#111111", borderColor: "#2a2a2a" }}>
          {movie.overview && (
            <p className="text-xs leading-relaxed px-3 pt-3 pb-1 line-clamp-4" style={{ color: "#8a8070" }}>
              {movie.overview}
            </p>
          )}
          <StreamingBadges movieId={movie.id} />
          <ScoreBreakdown movie={movie} />
        </div>
      )}

      {trailerKey && (
        <TrailerModal trailerKey={trailerKey} title={movie.title} onClose={() => setTrailerKey(null)} />
      )}
      {showToast && (
        <Toast message="No trailer available" onDismiss={() => setShowToast(false)} />
      )}
    </article>
  );
}

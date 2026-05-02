import { useState } from "react";
import type { ScoredMovie } from "../../types/movie";
import { POSTER_BASE_URL } from "../../api/tmdb";
import { MaturityBadge } from "./MaturityBadge";
import { RatingBadge } from "./RatingBadge";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { WatchlistButton } from "../WatchlistButton";

interface Props {
  movie: ScoredMovie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: ScoredMovie) => void;
  isSelected: boolean;
  onToggleCompare: (movie: ScoredMovie) => void;
  compareDisabled: boolean;
}

export function MovieCard({
  movie,
  isInWatchlist,
  onToggleWatchlist,
  isSelected,
  onToggleCompare,
  compareDisabled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : null;

  return (
    <article
      className={`relative group bg-gray-900 rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
        isSelected
          ? "border-violet-500 ring-2 ring-violet-500/40"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      {/* Poster */}
      <div
        className="relative aspect-[2/3] bg-gray-800 cursor-pointer overflow-hidden"
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
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {expanded ? "Hide details" : "Show details"}
          </span>
        </div>

        {/* Composite score badge */}
        <div className="absolute top-2 left-2 bg-black/70 rounded-md px-2 py-0.5 text-xs font-bold text-violet-300">
          {(movie.compositeScore * 100).toFixed(0)}
        </div>

        {/* Watchlist button */}
        <div className="absolute top-2 right-2">
          <WatchlistButton
            inWatchlist={isInWatchlist}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie);
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3
          className="text-sm font-semibold text-white leading-tight line-clamp-2 cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
        >
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <RatingBadge rating={movie.rating} />
          <span className="text-gray-500 text-xs">{movie.release_year}</span>
          <MaturityBadge maturity={movie.maturity} />
        </div>

        {/* Genres */}
        {movie.genres.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {movie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Compare toggle */}
        <button
          onClick={() => onToggleCompare(movie)}
          disabled={compareDisabled && !isSelected}
          className={`mt-auto pt-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isSelected ? "text-violet-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {isSelected ? "✓ Comparing" : "+ Compare"}
        </button>
      </div>

      {/* Expandable breakdown */}
      {expanded && (
        <div className="border-t border-gray-800 bg-gray-950">
          {/* Overview */}
          {movie.overview && (
            <p className="text-xs text-gray-400 leading-relaxed px-3 pt-3 pb-1 line-clamp-4">
              {movie.overview}
            </p>
          )}
          <ScoreBreakdown movie={movie} />
        </div>
      )}
    </article>
  );
}

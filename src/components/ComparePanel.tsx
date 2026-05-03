import type { ScoredMovie } from "../types/movie";
import { POSTER_BASE_URL } from "../api/tmdb";
import { RatingBadge } from "./MovieCard/RatingBadge";
import { MaturityBadge } from "./MovieCard/MaturityBadge";
import { ScoreBreakdown } from "./MovieCard/ScoreBreakdown";

interface Props {
  movies: [ScoredMovie, ScoredMovie];
  onClose: () => void;
}

function Column({ movie }: { movie: ScoredMovie }) {
  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : null;
  return (
    <div className="flex-1 min-w-0">
      <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3" style={{ background: "#111111" }}>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "#3a3028" }}>🎬</div>
        )}
      </div>
      <h3 className="font-display uppercase tracking-wide text-sm leading-tight mb-1" style={{ color: "#f5f0e8" }}>
        {movie.title}
      </h3>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <RatingBadge rating={movie.rating} />
        <span className="text-xs" style={{ color: "#6b6458" }}>{movie.release_year}</span>
        <MaturityBadge maturity={movie.maturity} />
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {movie.genres.map((g) => (
          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded font-display uppercase tracking-wide"
            style={{ background: "#111111", color: "#6b6458", border: "1px solid #2a2a2a" }}>
            {g}
          </span>
        ))}
      </div>
      <p className="text-xs leading-relaxed line-clamp-4 mb-3" style={{ color: "#8a8070" }}>
        {movie.overview}
      </p>
      <ScoreBreakdown movie={movie} />
    </div>
  );
}

export function ComparePanel({ movies, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border" style={{ background: "#1a1a1a", borderColor: "#2a2a2a" }}>
        <div className="brand-stripe rounded-t-2xl" />
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#2a2a2a" }}>
          <h2 className="font-display uppercase tracking-wider text-base" style={{ color: "#f5f0e8" }}>
            Side-by-Side Comparison
          </h2>
          <button
            onClick={onClose}
            className="transition-opacity hover:opacity-70 cursor-pointer"
            style={{ color: "#6b6458" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 flex gap-6">
          <Column movie={movies[0]} />
          <div className="w-px shrink-0" style={{ background: "#2a2a2a" }} />
          <Column movie={movies[1]} />
        </div>
      </div>
    </div>
  );
}

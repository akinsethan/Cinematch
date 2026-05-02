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
      {/* Poster */}
      <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden mb-3">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">🎬</div>
        )}
      </div>
      <h3 className="font-bold text-white mb-1">{movie.title}</h3>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <RatingBadge rating={movie.rating} />
        <span className="text-gray-400 text-sm">{movie.release_year}</span>
        <MaturityBadge maturity={movie.maturity} />
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {movie.genres.map((g) => (
          <span key={g} className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
            {g}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-4 mb-3">
        {movie.overview}
      </p>
      <ScoreBreakdown movie={movie} />
    </div>
  );
}

export function ComparePanel({ movies, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Side-by-Side Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 flex gap-6">
          <Column movie={movies[0]} />
          <div className="w-px bg-gray-800 shrink-0" />
          <Column movie={movies[1]} />
        </div>
      </div>
    </div>
  );
}

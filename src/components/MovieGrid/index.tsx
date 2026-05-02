import type { ScoredMovie } from "../../types/movie";
import { MovieCard } from "../MovieCard";

interface Props {
  movies: ScoredMovie[];
  watchlist: Set<number>;
  onToggleWatchlist: (movie: ScoredMovie) => void;
  compareIds: number[];
  onToggleCompare: (movie: ScoredMovie) => void;
}

export function MovieGrid({
  movies,
  watchlist,
  onToggleWatchlist,
  compareIds,
  onToggleCompare,
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isInWatchlist={watchlist.has(movie.id)}
          onToggleWatchlist={onToggleWatchlist}
          isSelected={compareIds.includes(movie.id)}
          onToggleCompare={onToggleCompare}
          compareDisabled={compareIds.length >= 2}
        />
      ))}
    </div>
  );
}

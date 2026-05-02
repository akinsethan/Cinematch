import type { Movie, ScoredMovie, Genre } from "../types/movie";

const CURRENT_YEAR = new Date().getFullYear();

export function computeScore(
  movie: Movie,
  selectedGenres: Genre[]
): ScoredMovie {
  const normalizedRating = movie.rating / 10;
  const normalizedPopularity = Math.min(movie.popularity / 1000, 1);

  let genreMatchScore: number;
  if (selectedGenres.length === 0) {
    genreMatchScore = 1.0;
  } else {
    const matched = selectedGenres.filter((g) => movie.genres.includes(g));
    genreMatchScore = matched.length / selectedGenres.length;
  }

  const recencyScore =
    (movie.release_year - 1970) / (CURRENT_YEAR - 1970);

  const compositeScore =
    normalizedRating * 0.4 +
    normalizedPopularity * 0.25 +
    genreMatchScore * 0.25 +
    recencyScore * 0.1;

  return {
    ...movie,
    compositeScore,
    scoreBreakdown: {
      normalizedRating,
      normalizedPopularity,
      genreMatchScore,
      recencyScore,
    },
  };
}

export function rankMovies(
  movies: Movie[],
  selectedGenres: Genre[]
): ScoredMovie[] {
  return movies
    .filter((m) => m.vote_count > 100)
    .map((m) => computeScore(m, selectedGenres))
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 20);
}

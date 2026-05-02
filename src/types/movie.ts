export type MaturityRating = "Family" | "Teen" | "Mature";

export interface Movie {
  id: number;
  title: string;
  rating: number;
  genres: string[];
  maturity: MaturityRating;
  vote_count: number;
  release_year: number;
  popularity: number;
  overview: string;
  poster_path: string | null;
}

export interface ScoredMovie extends Movie {
  compositeScore: number;
  scoreBreakdown: {
    normalizedRating: number;
    normalizedPopularity: number;
    genreMatchScore: number;
    recencyScore: number;
  };
}

export type Genre =
  | "Action"
  | "Comedy"
  | "Drama"
  | "Horror"
  | "Sci-Fi"
  | "Romance"
  | "Thriller"
  | "Animation"
  | "Documentary";

export type MaturityFilter = "All" | MaturityRating;

export type DecadeFilter = "All" | "1980s" | "1990s" | "2000s" | "2010s" | "2020s";

export type SortBy = "Composite Score" | "Rating" | "Popularity" | "Release Year";

export interface Filters {
  genres: Genre[];
  maturity: MaturityFilter;
  decade: DecadeFilter;
  minRating: number;
  sortBy: SortBy;
}

export const DEFAULT_FILTERS: Filters = {
  genres: [],
  maturity: "All",
  decade: "All",
  minRating: 0,
  sortBy: "Composite Score",
};

export const GENRE_LIST: Genre[] = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation",
  "Documentary",
];

// TMDB genre IDs mapped to our genre names
export const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  35: "Comedy",
  18: "Drama",
  27: "Horror",
  878: "Sci-Fi",
  10749: "Romance",
  53: "Thriller",
  16: "Animation",
  99: "Documentary",
  12: "Adventure",
  14: "Fantasy",
  36: "History",
  10402: "Music",
  9648: "Mystery",
  10752: "War",
  37: "Western",
  80: "Crime",
  10751: "Family",
  10770: "TV Movie",
  10768: "War & Politics",
};

export const GENRE_TO_TMDB_ID: Record<Genre, number> = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  "Sci-Fi": 878,
  Romance: 10749,
  Thriller: 53,
  Animation: 16,
  Documentary: 99,
};

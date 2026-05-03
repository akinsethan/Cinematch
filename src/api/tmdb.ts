import type { Movie, MaturityRating } from "../types/movie";

// ---------------------------------------------------------------------------
// Config — supports both a v3 API key (short string) and a v4 Read Access
// Token (JWT starting with "ey"). When the value looks like a JWT we send it
// as "Authorization: Bearer <token>" instead of the api_key query param.
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_API_KEY as string;

export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const IS_BEARER = TOKEN?.startsWith("ey");

function authHeaders(): HeadersInit {
  return IS_BEARER ? { Authorization: `Bearer ${TOKEN}` } : {};
}

function authParam(): Record<string, string> {
  return IS_BEARER ? {} : { api_key: TOKEN };
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

const cache = new Map<string, unknown>();

function getCacheKey(path: string, params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${path}?${sorted}`;
}

// ---------------------------------------------------------------------------
// Exponential-backoff fetch (max 3 retries on 429)
// ---------------------------------------------------------------------------

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 500
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
    return fetchWithRetry(url, options, retries - 1, delayMs * 2);
  }
  return res;
}

// ---------------------------------------------------------------------------
// Raw TMDB types
// ---------------------------------------------------------------------------

interface TmdbMovieResult {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[];
}

interface TmdbReleaseDateEntry {
  certification: string;
  iso_639_1: string;
  release_date: string;
  type: number;
}

interface TmdbReleaseCountry {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateEntry[];
}

interface TmdbMovieDetails extends TmdbMovieResult {
  release_dates?: {
    results: TmdbReleaseCountry[];
  };
  genres?: { id: number; name: string }[];
}

interface TmdbPage {
  results: TmdbMovieResult[];
  total_pages: number;
}

// ---------------------------------------------------------------------------
// Maturity mapping
// ---------------------------------------------------------------------------

const FAMILY_CERTS = new Set(["G", "PG", "TV-G", "TV-Y", "TV-Y7", "NR", ""]);
const TEEN_CERTS = new Set(["PG-13", "TV-14", "TV-PG"]);
const MATURE_CERTS = new Set(["R", "NC-17", "TV-MA"]);

function certToMaturity(cert: string): MaturityRating {
  if (MATURE_CERTS.has(cert)) return "Mature";
  if (TEEN_CERTS.has(cert)) return "Teen";
  if (FAMILY_CERTS.has(cert)) return "Family";
  console.warn(`[TMDB] Unknown certification "${cert}", defaulting to Family`);
  return "Family";
}

function extractUSCertification(details: TmdbMovieDetails): MaturityRating {
  const releaseDates = details.release_dates?.results ?? [];
  const usEntry = releaseDates.find((r) => r.iso_3166_1 === "US");
  if (!usEntry) {
    if (details.title) {
      console.warn(
        `[TMDB] No US certification for "${details.title}", defaulting to Family`
      );
    }
    return "Family";
  }
  const theatrical = usEntry.release_dates.find(
    (rd) => rd.type === 3 && rd.certification
  );
  if (theatrical) return certToMaturity(theatrical.certification);

  const anyCert = usEntry.release_dates.find((rd) => rd.certification);
  if (anyCert) return certToMaturity(anyCert.certification);

  console.warn(
    `[TMDB] US entry has no certification for "${details.title}", defaulting to Family`
  );
  return "Family";
}

// ---------------------------------------------------------------------------
// Genre ID → name resolution
// ---------------------------------------------------------------------------

let genreMapCache: Map<number, string> | null = null;

async function fetchGenreMap(): Promise<Map<number, string>> {
  if (genreMapCache) return genreMapCache;
  const cacheKey = "genres";
  if (cache.has(cacheKey)) {
    genreMapCache = cache.get(cacheKey) as Map<number, string>;
    return genreMapCache;
  }
  const params = { ...authParam(), language: "en-US" };
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/genre/movie/list?${qs}`;
  const res = await fetchWithRetry(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Genre fetch failed: ${res.status}`);
  const data: { genres: { id: number; name: string }[] } = await res.json();
  const map = new Map(data.genres.map((g) => [g.id, g.name]));
  cache.set(cacheKey, map);
  genreMapCache = map;
  return map;
}

// ---------------------------------------------------------------------------
// Core TMDB fetch function
// ---------------------------------------------------------------------------

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const allParams = { ...params, ...authParam(), language: "en-US" };
  const cacheKey = getCacheKey(path, allParams);
  if (cache.has(cacheKey)) return cache.get(cacheKey) as T;

  const qs = new URLSearchParams(allParams).toString();
  const url = `${BASE_URL}${path}?${qs}`;
  const res = await fetchWithRetry(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB ${path} failed ${res.status}: ${text}`);
  }
  const data: T = await res.json();
  cache.set(cacheKey, data);
  return data;
}

// ---------------------------------------------------------------------------
// Build movie object from details
// ---------------------------------------------------------------------------

async function detailsToMovie(
  details: TmdbMovieDetails,
  genreMap: Map<number, string>
): Promise<Movie | null> {
  if (details.vote_count < 100) return null;

  const releaseYear = details.release_date
    ? parseInt(details.release_date.slice(0, 4), 10)
    : 0;

  const genres = (details.genre_ids ?? details.genres?.map((g) => g.id) ?? [])
    .map((id) => genreMap.get(id))
    .filter((g): g is string => !!g);

  const maturity = extractUSCertification(details);

  return {
    id: details.id,
    title: details.title,
    rating: details.vote_average,
    genres,
    maturity,
    vote_count: details.vote_count,
    release_year: releaseYear,
    popularity: details.popularity,
    overview: details.overview,
    poster_path: details.poster_path,
  };
}

// ---------------------------------------------------------------------------
// Public API: discover movies
// ---------------------------------------------------------------------------

export interface DiscoverParams {
  genreIds?: number[];
  decadeStart?: number;
  decadeEnd?: number;
  minRating?: number;
  page?: number;
}

export async function discoverMovies(params: DiscoverParams = {}): Promise<Movie[]> {
  const genreMap = await fetchGenreMap();

  const queryParams: Record<string, string> = {
    sort_by: "popularity.desc",
    include_adult: "false",
    "vote_count.gte": "100",
  };

  if (params.genreIds && params.genreIds.length > 0) {
    queryParams.with_genres = params.genreIds.join(",");
  }
  if (params.decadeStart) {
    queryParams["primary_release_date.gte"] = `${params.decadeStart}-01-01`;
  }
  if (params.decadeEnd) {
    queryParams["primary_release_date.lte"] = `${params.decadeEnd}-12-31`;
  }
  if (params.minRating && params.minRating > 0) {
    queryParams["vote_average.gte"] = String(params.minRating);
  }

  // Fetch 3 pages to give the ranking algorithm enough material
  const pageCount = 3;
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, i) =>
      tmdbFetch<TmdbPage>("/discover/movie", {
        ...queryParams,
        page: String((params.page ?? 0) * pageCount + i + 1),
      })
    )
  );

  const allResults = pages.flatMap((p) => p.results);

  // Fetch certification details in batches
  const BATCH = 20;
  const movies: Movie[] = [];

  for (let i = 0; i < allResults.length; i += BATCH) {
    const batch = allResults.slice(i, i + BATCH);
    const detailsArr = await Promise.all(
      batch.map((r) =>
        tmdbFetch<TmdbMovieDetails>(`/movie/${r.id}`, {
          append_to_response: "release_dates",
        }).then((d) => ({
          ...d,
          genre_ids: r.genre_ids,
        }))
      )
    );
    const resolved = await Promise.all(
      detailsArr.map((d) => detailsToMovie(d, genreMap))
    );
    for (const m of resolved) {
      if (m) movies.push(m);
    }
  }

  return movies;
}

// ---------------------------------------------------------------------------
// Watch providers (stretch goal)
// ---------------------------------------------------------------------------

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Only flatrate = subscription streaming (not rent/buy)
export async function getWatchProviders(
  movieId: number
): Promise<WatchProvider[]> {
  const cacheKey = `watch_providers_${movieId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) as WatchProvider[];

  try {
    const data = await tmdbFetch<{
      results: Record<
        string,
        { flatrate?: WatchProvider[]; link?: string }
      >;
    }>(`/movie/${movieId}/watch/providers`);

    const flatrate = data.results?.US?.flatrate ?? [];
    const seen = new Set<number>();
    const unique = flatrate.filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
    cache.set(cacheKey, unique);
    return unique;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Trailers
// ---------------------------------------------------------------------------

// Returns the YouTube key for the first official Trailer, or null if none.
export async function getTrailerKey(movieId: number): Promise<string | null> {
  const cacheKey = `trailer_${movieId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) as string | null;

  try {
    const data = await tmdbFetch<{
      results: { type: string; site: string; key: string; official: boolean }[];
    }>(`/movie/${movieId}/videos`);

    const trailer =
      data.results.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ??
      data.results.find((v) => v.type === "Trailer" && v.site === "YouTube") ??
      null;

    const key = trailer?.key ?? null;
    cache.set(cacheKey, key);
    return key;
  } catch {
    return null;
  }
}

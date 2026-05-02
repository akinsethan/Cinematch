import type { Movie, MaturityRating } from "../types/movie";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.themoviedb.org/3";

// TMDB free-tier public API key (v3 auth via query param)
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;

export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

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
  retries = 3,
  delayMs = 500
): Promise<Response> {
  const res = await fetch(url);
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
    return fetchWithRetry(url, retries - 1, delayMs * 2);
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
  // Unknown cert — default Family and warn
  console.warn(`[TMDB] Unknown certification "${cert}", defaulting to Family`);
  return "Family";
}

function extractUSCertification(details: TmdbMovieDetails): MaturityRating {
  const releaseDates = details.release_dates?.results ?? [];
  const usEntry = releaseDates.find((r) => r.iso_3166_1 === "US");
  if (!usEntry) {
    // No US rating at all — default to Family as per spec
    if (details.title) {
      console.warn(
        `[TMDB] No US certification for "${details.title}", defaulting to Family`
      );
    }
    return "Family";
  }
  // Pick the theatrical release (type 3) first, then any non-empty cert
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
  const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;
  const res = await fetchWithRetry(url);
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
  const allParams = { ...params, api_key: API_KEY, language: "en-US" };
  const cacheKey = getCacheKey(path, allParams);
  if (cache.has(cacheKey)) return cache.get(cacheKey) as T;

  const qs = new URLSearchParams(allParams).toString();
  const url = `${BASE_URL}${path}?${qs}`;
  const res = await fetchWithRetry(url);
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
  genreIds?: number[];      // TMDB genre IDs to filter by
  decadeStart?: number;     // e.g. 1990
  decadeEnd?: number;       // e.g. 1999
  minRating?: number;       // vote_average.gte
  page?: number;
}

export async function discoverMovies(params: DiscoverParams = {}): Promise<Movie[]> {
  const genreMap = await fetchGenreMap();

  const queryParams: Record<string, string> = {
    sort_by: "popularity.desc",
    include_adult: "false",
    "vote_count.gte": "100",
    append_to_response: "release_dates",
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

  // Fetch certification details in parallel (batch to avoid hammering the API)
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
          // Preserve genre_ids from list result (details use genres array)
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

export async function getWatchProviders(
  movieId: number
): Promise<WatchProvider[]> {
  const cacheKey = `watch_providers_${movieId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) as WatchProvider[];

  try {
    const data = await tmdbFetch<{
      results: Record<string, { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
    }>(`/movie/${movieId}/watch/providers`);

    const us = data.results?.US;
    const providers: WatchProvider[] = [
      ...(us?.flatrate ?? []),
      ...(us?.rent ?? []),
      ...(us?.buy ?? []),
    ];
    // Deduplicate by provider_id
    const seen = new Set<number>();
    const unique = providers.filter((p) => {
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

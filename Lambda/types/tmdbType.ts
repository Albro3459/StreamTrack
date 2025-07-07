
export enum TMDB_MEDIA_TYPE {
    MOVIE = "movie",
    TV = "tv"
}

export type TMDB_Content = {
    id: number;

    // Movie:
    title: string | null;
    original_title: string | null;

    // TV Show:
    name: string | null;
    original_name:  string | null;

    // Both
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    media_type: TMDB_MEDIA_TYPE;
    adult: boolean;
    original_language: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;

    // CUSTOM
    large_poster_path?: string | null;
}

export type TMDB = {
    page: number;
    results: Array<TMDB_Content>;
    total_pages: number;
    total_results: number;
};
  
export default {};
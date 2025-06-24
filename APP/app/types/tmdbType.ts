
export enum MEDIA_TYPE {
    MOVIE = "movie",
    TV = "tv"
}

export type TMDB_Content = {
    backdrop_path: string | null;
    id: number;

    // Movie:
    title: string | null;
    original_title: string | null;

    // TV Show:
    name: string | null;
    original_name:  string | null;
    overview: string;
    poster_path: string | null;
    media_type: MEDIA_TYPE;
    adult: boolean;
    original_language: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export type TMDB = {
    page: number;
    results: Array<TMDB_Content>;
    total_pages: number;
    total_results: number;
};
  
export default {};
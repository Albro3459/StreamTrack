// "poster_sizes": [
//   "w92",
//   "w154",
//   "w185",
//   "w342",
//   "w500",
//   "w780",
//   "original"
// ],
// "backdrop_sizes": [
//   "w300",
//   "w780",
//   "w1280",
//   "original"
// ],
// "logo_sizes": [
//   "w45",
//   "w92",
//   "w154",
//   "w185",
//   "w300",
//   "w500",
//   "original"
// ],

export type TMDB_Posters = {
    verticalPoster: string;
    largeVerticalPoster: string;
    horizontalPoster: string;
}

export enum TMDB_MEDIA_TYPE {
    MOVIE = "movie",
    TV = "tv",
    PERSON = "person",
    COLLECTION = "collection"
}

export type TMDB_Content = {
    id: number;

    // Movie:
    title: string | null;
    original_title: string | null;
    release_date: string | null;

    // TV Show:
    name: string | null;
    original_name:  string | null;
    first_air_date: string | null;

    // Both
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    media_type: TMDB_MEDIA_TYPE;
    adult: boolean;
    original_language: string;
    genre_ids: number[];
    popularity: number;
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
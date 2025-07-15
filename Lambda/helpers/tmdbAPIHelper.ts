import { TMDB_BEARER_TOKEN } from "../secrets/API_keys";
import { TMDB_Content } from "../types/tmdbType";

// Posters API
const TMDB_Base_Url = "https://api.themoviedb.org/3/";
const TMDB_Ending = "?language=en-US";

export type Posters = {
    verticalPoster: string;
    largeVerticalPoster: string;
    horizontalPoster: string;
}

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

export const getPosters = async (tmdbID: string): Promise<Posters> => {

    // tmdbID is in the form "movie/38055" or "show/xxx"
        // pass this in directly

    const url = TMDB_Base_Url + tmdbID + TMDB_Ending;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: "Bearer " + TMDB_BEARER_TOKEN
        }
    };

    const result = await fetch(url, options);
    const data: TMDB_Content = await result.json();

    return { verticalPoster: data.poster_path ? "https://image.tmdb.org/t/p/w185" + data.poster_path : null,
             largeVerticalPoster: data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : null,
             horizontalPoster: data.backdrop_path ? "https://image.tmdb.org/t/p/w1280" + data.backdrop_path : null
    } as Posters;

}
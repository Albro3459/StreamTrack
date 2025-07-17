// import { TMDB_BEARER_TOKEN } from "../secrets/API_keys";
import { TMDB_Base_Url, TMDB_Ending } from "../URLs";
import { TMDB_Content, TMDB_Posters } from "../types/tmdbType";

// Posters API
// const TMDB_Base_Url = "https://api.themoviedb.org/3/";
// const TMDB_Ending = "?language=en-US";

export const getPosters = async (TMDB_BEARER_TOKEN: string, tmdbID: string): Promise<TMDB_Posters> => {

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
    } as TMDB_Posters;

}
"use client";

import { TMDB_BEARER_TOKEN } from '@/secrets/API_keys';
import { TMDB_MEDIA_TYPE, TMDB } from '../types/tmdbType';

// TMDB Search API
const TMDB_Base_Url = "https://api.themoviedb.org/3/search/multi?query=";
const TMDB_Ending = "&include_adult=false&language=en-US&page=1";

export const TMDBSearch = async (keyword: string): Promise<TMDB> => {

    // Content IDs will have integer values like "11"
        // Take that to use for details in RapidAPIGetByID and prepend the media_type so "movie/11" or "tv/xxx"

    const url = TMDB_Base_Url + keyword + TMDB_Ending;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: TMDB_BEARER_TOKEN
        }
    };

    const result = await fetch(url, options);
    const data: TMDB = await result.json();

    // data.results = data.results.filter(x => x.poster_path && (x.media_type === "tv" || x.media_type === "movie")); // maybe filter out content without posters
    data.results = data.results.filter(x => x.media_type === TMDB_MEDIA_TYPE.TV || x.media_type === TMDB_MEDIA_TYPE.MOVIE);
    data.results = data.results.map(x => ({
        ...x,
        backdrop_path: x.backdrop_path ? "https://image.tmdb.org/t/p/w1280" + x.backdrop_path : null,
        poster_path: x.poster_path ? "https://image.tmdb.org/t/p/w500" + x.poster_path : null,
    }));

    return data;
}

export default {}
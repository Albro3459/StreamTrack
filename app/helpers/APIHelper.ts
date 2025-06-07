import axios from 'axios';

import { RAPIDAPI_KEY, TMDB_BEARER_TOKEN } from '@/secrets/API_keys';
import { MEDIA_TYPE, TMDB, TMDB_inner, TMDB_new } from '../types/tmdbType';
import { Content, PosterContent, Posters } from '../types/contentType';

// Going to fetch from the API.

// Probably will use for evrything like searching and lists

// const getPosterURI = async (imdbID: string): Promise<Posters> => {
//   const options = {
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//       Authorization: `Bearer ${TMDB_BEARER_TOKEN}`
//     }
//   };

//   const baseURL = "https://api.themoviedb.org/3/find/";
//   const ending = "?external_source=imdb_id";
  
//   try {
//     const response = await fetch(`${baseURL}${imdbID}${ending}`, options);
//     const data: TMDB = await response.json();

//     if (data.tv_results.length > 0) {
//       const tvResult = data.tv_results[0];
//       return {
//         vertical: tvResult.poster_path || "",
//         horizontal: tvResult.backdrop_path || "",
//       };
//     } else if (data.movie_results.length > 0) {
//       const movieResult = data.movie_results[0];
//       return {
//         vertical: movieResult.poster_path || "",
//         horizontal: movieResult.backdrop_path || "",
//       };
//     }

//     return { vertical: "", horizontal: "" }; // No results found
//   } catch (err) {
//     console.error("Error in getPosterURI:", err);
//     return { vertical: "", horizontal: "" }; // Error case
//   }
// };

export const TMDBSearch = async (keyword): Promise<TMDB_new> => {

    // Content IDs will have integer values like "11"
        // Take that to use for details in RapidAPIGetByID and prepend the media_type so "movie/11" or "tv/xxx"

    const url = `https://api.themoviedb.org/3/search/multi?query=${keyword}&include_adult=false&language=en-US&page=1`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNGFjN2UwNjBhMmUzNWI5ZDMzNTgwMDhjYzExM2RiYiIsIm5iZiI6MTcyNjQzMzk1Ni43NzYsInN1YiI6IjY2ZTc0YWE0ZGQyMjRkMWEzOTkxOGU0MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sptJrFa1S_M3bfD0Kt6VNObB0_gqIjzI59NIBVigi5M'
        }
    };

    const result = await fetch(url, options);
    const data: TMDB_new = await result.json();

    // data.results = data.results.filter(x => (x.media_type === "tv" || x.media_type === "movie") && x.poster_path);
    data.results = data.results.filter(x => x.media_type === "tv" || x.media_type === "movie");
    data.results = data.results.map(x => ({
        ...x,
        backdrop_path: x.backdrop_path ? "https://image.tmdb.org/t/p/w1280/" + x.backdrop_path : null,
        poster_path: x.poster_path ? "https://image.tmdb.org/t/p/w500/" + x.poster_path : null,
    }));

    return data;
}

const API_BASE_URL = 'https://streaming-availability.p.rapidapi.com/shows/';
const ending = "?series_granularity=show&output_language=en&country=us";

const API_HEADERS = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
};

export const RapidAPIGetByID = async (id: string, media_type: MEDIA_TYPE, vertical: string, horizontal: string): Promise<PosterContent> => {

    const url = `${API_BASE_URL}${media_type+"/"}${id}${ending}`;
    const options = {
        method: 'GET',
        url,
        headers: API_HEADERS
    };
    const result = await axios.request(options);
    
    const data: Content = await result.data;

    const posters: Posters = {
        vertical: vertical, horizontal: horizontal
    }

    const content: PosterContent = {
        ...data,
        posters: posters
    };

    return content;
}


export default {}
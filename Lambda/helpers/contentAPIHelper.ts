import axios, { AxiosRequestConfig } from 'axios';

import { RAPIDAPI_KEY, TMDB_BEARER_TOKEN } from '../secrets/API_keys';
import { MEDIA_TYPE, TMDB } from '../types/tmdbType';
import { Content } from '../types/contentType';
import { ContentData } from '../types/dataTypes';
import { convertContentToContentData } from './contentHelper';

// Search API
const TMDB_Base_Url = "https://api.themoviedb.org/3/search/multi?query=";
const TMDB_Ending = "&include_adult=false&language=en-US&page=1";

// Details API
const RapidAPI_Base_Url = 'https://streaming-availability.p.rapidapi.com/shows/';
const RapidAPI_Ending = "?series_granularity=show&output_language=en&country=us";
const RapidAPI_Headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
};

export const fetchByServiceAndGenre = async (service: string, genre: string): Promise<ContentData[]> => {
    const options = {
        method: 'GET',
        url: RapidAPI_Base_Url+"search/filters",
        params: {
            country: 'us',
            series_granularity: 'show',
            genres: genre,
            order_direction: 'desc',
            order_by: 'popularity_1week',
            output_language: 'en',
            catalogs: service
        },
        headers: RapidAPI_Headers
    };

    // console.log(options.url);
    // console.log(JSON.stringify({
    //     url: options.url,
    //     params: options.params,
    //     headers: options.headers
    // }, null, 2));

    const response = await axios.request(options);
    // console.log(JSON.stringify(response.data));

    const contents: Content[] = response.data.shows as Content[];
    const contentData: ContentData[] = contents.map(c => convertContentToContentData(c));

    // console.log(JSON.stringify(contentData));
    return contentData;
}


// export const TMDBSearch = async (keyword: string): Promise<TMDB> => {

//     // Content IDs will have integer values like "11"
//         // Take that to use for details in RapidAPIGetByID and prepend the media_type so "movie/11" or "tv/xxx"

//     const url = TMDB_Base_Url + keyword + TMDB_Ending;
//     const options = {
//         method: 'GET',
//         headers: {
//             accept: 'application/json',
//             Authorization: TMDB_BEARER_TOKEN
//         }
//     };

//     const result = await fetch(url, options);
//     const data: TMDB = await result.json();

//     // data.results = data.results.filter(x => x.poster_path (x.media_type === "tv" || x.media_type === "movie"));
//     data.results = data.results.filter(x => x.media_type === "tv" || x.media_type === "movie");
//     data.results = data.results.map(x => ({
//         ...x,
//         backdrop_path: x.backdrop_path ? "https://image.tmdb.org/t/p/w1280" + x.backdrop_path : null,
//         poster_path: x.poster_path ? "https://image.tmdb.org/t/p/w500" + x.poster_path : null,
//     }));

//     return data;
// }

// export const RapidAPIGetByTMDBID = async (tmdbID: string, media_type: MEDIA_TYPE, vertical: string, horizontal: string): Promise<ContentData> => {

//     const url = RapidAPI_Base_Url + media_type + "/" + tmdbID + RapidAPI_Ending;

//     const options = {
//         method: 'GET',
//         url,
//         headers: RapidAPI_Headers
//     };
//     const result = await axios.request(options);
    
//     const content: Content = await result.data;

//     const contentData: ContentData = convertContentToContentData(content, vertical, horizontal);

//     return contentData;
// }

// export const RapidAPIGetByRapidID = async (id: string, vertical: string, horizontal: string): Promise<ContentData> => {

//     const url = RapidAPI_Base_Url + id + RapidAPI_Ending;

//     const options = {
//         method: 'GET',
//         url,
//         headers: RapidAPI_Headers
//     };
//     const result = await axios.request(options);
    
//     const content: Content = await result.data;

//     const contentData: ContentData = convertContentToContentData(content, vertical, horizontal);

//     return contentData;
// }


export default {}
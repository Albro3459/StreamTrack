import axios from 'axios';

// import { RAPIDAPI_KEY } from '../secrets/API_keys';
import { Content } from '../types/contentType';
import { ContentData } from '../types/dataTypes';
import { convertContentToContentData } from './contentHelper';
import { GENRE, ORDER_BY, ORDER_DIRECTION, SERVICE, SHOW_TYPE } from '../types/contentFilterOptions';
import { getPosters } from './tmdbAPIHelper';
import { RapidAPI_Base_Url, RapidAPI_Headers, x_rapidapi_host } from '../URLs';
import { TMDB_Posters } from '../types/tmdbType';



const expiresRegex = /(?:^|[?&])Expires=(\d+)(?:&|$)/i;

const isBadPoster = (url?: string | null): boolean => {
    if (!url?.trim()) return true;

    const lowered = url.toLowerCase();
    if (lowered.includes('svg') || lowered.startsWith("https://www.")) return true;
    if (lowered.includes('cdn.movie') && !lowered.includes('signature')) return true;
    return false;
};

const isExpiringSoon = (url?: string | null): boolean => {
    if (!url?.trim()) return true;

    const match = expiresRegex.exec(url);
    if (!match) return false;

    const epochSeconds = Number(match[1]);
    if (!Number.isFinite(epochSeconds)) return false;

    return epochSeconds * 1000 <= Date.now() + 24 * 60 * 60 * 1000;
};

const shouldRefreshPoster = (url?: string | null): boolean => {
    return isBadPoster(url) || isExpiringSoon(url);
};

export const fetchByServiceAndGenre = async (RAPIDAPI_KEY: string, TMDB_BEARER_TOKEN: string, RATING_CUTOFF: number, service: SERVICE, genre: GENRE, show_type: SHOW_TYPE, order_by: ORDER_BY, order_direction: ORDER_DIRECTION): Promise<ContentData[] | null> => {
    // Details API
    // const RapidAPI_Base_Url = 'https://streaming-availability.p.rapidapi.com/shows/';
    // const RapidAPI_Headers = {
    //     'x-rapidapi-key': RAPIDAPI_KEY,
    //     'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
    // };

    const RapidAPI_Header: RapidAPI_Headers = {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': x_rapidapi_host
    };

    const options = {
        method: 'GET',
        url: RapidAPI_Base_Url+"search/filters",
        params: {
            country: 'us',
            series_granularity: 'show',
            genres: genre,
            order_direction: order_direction,
            order_by: order_by,
            // genres_relation: 'and', // Don't need this unless there are multiple
            output_language: 'en',
            catalogs: service,
            show_type: show_type
        },
        headers: RapidAPI_Header
    };

    const response = await axios.request(options);

    const contents: Content[] = response.data.shows as Content[];

    const contentData: ContentData[] = contents.filter(c => c.rating >= RATING_CUTOFF)
                                                .map(c => convertContentToContentData(c));

    await Promise.all(contentData.map(async c => {
        const badVerticalPoster: boolean = shouldRefreshPoster(c.verticalPoster);
        const badLargeVerticalPoster: boolean = shouldRefreshPoster(c.largeVerticalPoster);
        const badHorizontalPoster: boolean = shouldRefreshPoster(c.horizontalPoster);
        if (badVerticalPoster || badLargeVerticalPoster || badHorizontalPoster) {
            try {
                const posters: TMDB_Posters = await getPosters(TMDB_BEARER_TOKEN, c.tmdbID);
                c.verticalPoster = badVerticalPoster ? posters.verticalPoster : c.verticalPoster;
                c.largeVerticalPoster = badLargeVerticalPoster ? posters.largeVerticalPoster : c.largeVerticalPoster;
                c.horizontalPoster = badHorizontalPoster ? posters.horizontalPoster : c.horizontalPoster;
            } catch (e: any) {
                console.error("Failed to fetch posters for TMDB ID: " + c.tmdbID);
                return null; // crash out

            }
        }
    }));

    return contentData;
};

export default {}

import axios from 'axios';

import { RAPIDAPI_KEY } from '../secrets/API_keys';
import { Content } from '../types/contentType';
import { ContentData } from '../types/dataTypes';
import { convertContentToContentData } from './contentHelper';
import { GENRE, ORDER_BY, ORDER_DIRECTION, SERVICE, SHOW_TYPE } from '../types/contentFilterOptions';
import { getPosters, Posters } from './tmdbAPIHelper';

// Details API
const RapidAPI_Base_Url = 'https://streaming-availability.p.rapidapi.com/shows/';
const RapidAPI_Headers = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
};

const isBadPoster = (url: string): boolean => {
    if (!url ||  url.toLowerCase().includes('svg') || url.toLowerCase().startsWith("https://www.")) return true;
    return false;
};

export const fetchByServiceAndGenre = async (RATING_CUTOFF: number, service: SERVICE, genre: GENRE, show_type: SHOW_TYPE, order_by: ORDER_BY, order_direction: ORDER_DIRECTION): Promise<ContentData[] | null> => {
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
        headers: RapidAPI_Headers
    };

    const response = await axios.request(options);

    const contents: Content[] = response.data.shows as Content[];

    const contentData: ContentData[] = contents.filter(c => c.rating >= RATING_CUTOFF)
                                                .map(c => convertContentToContentData(c));

    await Promise.all(contentData.map(async c => {
        const badVerticalPoster: boolean = isBadPoster(c.verticalPoster);
        const badLargeVerticalPoster: boolean = isBadPoster(c.largeVerticalPoster);
        const badHorizontalPoster: boolean = isBadPoster(c.horizontalPoster);
        if (badVerticalPoster || badLargeVerticalPoster || badHorizontalPoster) {
            try {
                const posters: Posters = await getPosters(c.tmdbID);
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
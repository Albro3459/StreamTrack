import { Content, SHOW_TYPE } from "@/app/types/contentType";
import { ContentData } from "@/app/types/dataTypes";
import { TMDB_MEDIA_TYPE } from "@/app/types/tmdbType";
import { DataAPIURL } from "@/secrets/DataAPIUrl";

export const getContentByTMDBID = async (token: string, tmdbID: string): Promise<ContentData | null> => {
    try {
        const url = DataAPIURL + `API/Content/GetDetails/${tmdbID}`;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error getting content by TMDB ID ${result.status}: ${text}`);
            return null;
        }

        const data: ContentData = await result.json();
        
        return data;
    } catch (err) {
        console.error('Fetch content by TMDB ID failed:', err);
        return null;
    }
};

export const convertContentToContentData = (content: Content, verticalPoster: string, horizontalPoster: string): ContentData => {
    return {
        tmdbID: content.tmdbId,
        title: content.title,
        overview: content.overview,
        releaseYear: content.releaseYear ? content.releaseYear : 0,
        rapidID: content.id,
        imdbID: content.imdbId,
        showType: content.showType as SHOW_TYPE,
        genres: content.genres.map(g => ({ name: g.name })),
        cast: content.cast,
        directors: content.directors,
        rating: content.rating,
        runtime: content.runtime ?? null,
        seasonCount: content.seasonCount ?? null,
        episodeCount: content.episodeCount ?? null,
        streamingOptions: (content.streamingOptions['us'] || []).map(option => ({
            // NO CONTENT because we need to avoid a CYCLE
            streamingService: {
                name: option.service.name,
                lightLogo: option.service.imageSet.lightThemeImage,
                darkLogo: option.service.imageSet.darkThemeImage,
            },
            type: option.type,
            price: option.price?.amount ?? null,
            deepLink: option.link,
        })),
        verticalPoster: verticalPoster,
        horizontalPoster: horizontalPoster,
    };
};

export default {};
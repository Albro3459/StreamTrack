import { Content, SHOW_TYPE } from "../types/contentType";
import { ContentData } from "../types/dataTypes";

export const convertContentToContentData = (content: Content): ContentData => {
    return {
        tmdbID: content.tmdbId,
        title: content.title,
        overview: content.overview,
        releaseYear: content.releaseYear,
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
        verticalPoster: content.imageSet.verticalPoster.w240 ?? "",
        largeVerticalPoster: content.imageSet.verticalPoster.w480 ?? "",
        horizontalPoster: content.imageSet.horizontalPoster.w1080 ?? "",
    };
};

export default {};
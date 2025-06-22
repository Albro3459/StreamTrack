import { PosterContent } from "@/app/types/contentType";
import { ContentData } from "@/app/types/dataTypes";

export const convertPosterContentToContentData = (posterContent: PosterContent): ContentData => {
    return {
        contentID: posterContent.id,
        title: posterContent.title,
        overview: posterContent.overview,
        releaseYear: posterContent.releaseYear,
        imdb_ID: posterContent.imdbId,
        tmdb_ID: posterContent.tmdbId,
        showType: posterContent.showType,
        genres: posterContent.genres.map(g => ({ name: g.name })),
        cast: posterContent.cast,
        directors: posterContent.directors,
        rating: posterContent.rating,
        runtime: posterContent.runtime ?? null,
        seasonCount: posterContent.seasonCount ?? null,
        episodeCount: posterContent.episodeCount ?? null,
        streamingOptions: (posterContent.streamingOptions['us'] || []).map(option => ({
            // NO CONTENT because we need to avoid a CYCLE
            streamingService: {
                name: option.service.name,
                logo: option.service.imageSet.darkThemeImage,
            },
            type: option.type,
            price: option.price?.amount ?? null,
            deepLink: option.link,
        })),
        verticalPoster: posterContent.posters.vertical ?? '',
        horizontalPoster: posterContent.posters.horizontal ?? '',
    };
};

export default {};
import { ContentData, ContentPartialData, ContentRequestData, ContentSimpleData, PopularContentData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";

export const contentSimpleToPartial = (simple: ContentSimpleData): ContentPartialData => {
    return {
        tmdbID: simple.tmdbID,
        title: simple.title,
        overview: simple.overview,
        rating: simple.rating,
        releaseYear: simple.releaseYear,
        verticalPoster: simple.verticalPoster,
        horizontalPoster: simple.horizontalPoster
    };
};

export const getContentDetails = async (token: string, content: ContentRequestData): Promise<ContentData | null> => {
    try {
        const url = DataAPIURL + "API/Content/Details";

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(content)
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error getting content details ${result.status}: ${text}`);
            return null;
        }

        const data: ContentData = await result.json();
        
        return data;
    } catch (err) {
        console.error('Get content details failed:', err);
        return null;
    }
};

export const getPopularContent = async (token: string) : Promise<PopularContentData | null> => {
    try {
        const url = DataAPIURL + "API/Content/Popular";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error getting popular content ${result.status}: ${text}`);
            return null;
        }

        const data: PopularContentData = await result.json();
        
        return data;
    } catch (err) {
        console.error('Get popular content failed:', err);
        return null;
    }
};

export default {};
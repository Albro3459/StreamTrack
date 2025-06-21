import { PosterContent } from "@/app/types/contentType";
import { ContentData } from "@/app/types/dataTypes";
import { RapidAPIGetByRapidID, RapidAPIGetByTMDBID } from "../contentAPIHelper";
import { MEDIA_TYPE } from "@/app/types/tmdbType";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { convertPosterContentToContentData } from "./contentHelper";

export const testSendingContent = async (token: string) => {
    const posterContent: PosterContent = await RapidAPIGetByRapidID("1544", "ninja", "ninjers");

    await addContentToUserList(token, "Favorites", posterContent);
};

export const addContentToUserList = async (token: string | null, listName: string, posterContent: PosterContent) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Add`;

        console.log(posterContent);

        const body: ContentData = convertPosterContentToContentData(posterContent);

        console.log(body);

        const options = {
            method: 'PATCH',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };

        // const result = await fetch(url, options);

        // if (!result.ok) {
        //     const text = await result.text();
        //     console.error(`Error creating user ${result.status}: ${text}`);
        //     return null;
        // }

    } catch (err) {
        console.error('Create user failed:', err);
    }
};

export default {};
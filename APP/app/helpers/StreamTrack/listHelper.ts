import { PosterContent } from "@/app/types/contentType";
import { ContentData } from "@/app/types/dataTypes";
import { RapidAPIGetByRapidID, RapidAPIGetByTMDBID } from "../contentAPIHelper";
import { MEDIA_TYPE } from "@/app/types/tmdbType";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { convertPosterContentToContentData } from "./contentHelper";

export const testSendingContent = async (token: string) => {
    const posterContent: PosterContent = await RapidAPIGetByRapidID("1544", "https://image.tmdb.org/t/p/w500/uZ9ytt3sPTx62XTfN56ILSuYWRe.jpg", "https://image.tmdb.org/t/p/w1280/irpJXGiVr539uuspcQcNdkhS2lq.jpg");

    await addContentToUserList(token, "Favorites", posterContent);
};

export const addContentToUserList = async (token: string | null, listName: string, posterContent: PosterContent) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Add`;
        // console.log(url);

        // console.log(posterContent);

        const body: ContentData = convertPosterContentToContentData(posterContent);

        // console.log(body);
        console.log(JSON.stringify(body, null, 4));

        const options = {
            method: 'PATCH',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error adding content to list ${result.status}: ${text}`);
            return null;
        }

    } catch (err) {
        console.error('Adding content to list failed:', err);
    }
};

export default {};
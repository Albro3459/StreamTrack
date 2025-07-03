import { DataAPIURL } from "../secrets/DataAPIUrl";
import { ContentData } from "../types/dataTypes";

export const updatePopularContents = async (token: string | null, contents: ContentData[]): Promise<number | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/Content/Popular/Update`;
                
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(contents)
        };

        // console.log( JSON.stringify(contents));

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error bulk updating contents (${result.status}): ${text}`);
            return result.status;
        }

        return result.status;

    } catch (err) {
        console.error('Bulk updating contents failed:', err);
        return null;
    }
};
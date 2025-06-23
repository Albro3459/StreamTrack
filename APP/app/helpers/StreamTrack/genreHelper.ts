import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { GenreData } from "../../types/dataTypes";

export const getGenreData = async (token: string): Promise<GenreData[] | null> => {
    try {
        const url = DataAPIURL + "API/Genre/GetMain";

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
            console.error(`Error getting genre data ${result.status}: ${text}`);
            return null;
        }

        const data: GenreData[] = await result.json();
        return data;
    } catch (err) {
        console.error('Fetch genre data failed:', err);
        return null;
    }
};

export default {};
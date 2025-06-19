import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { UserData } from "../types/StreamTrackAPI/types";

export const getUserData = async (token: string): Promise<UserData | null> => {
    try {
        const url = DataAPIURL + "API/User/Get";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        // console.log(token);

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error ${result.status}: ${text}`);
            return null;
        }

        const data: UserData = await result.json();
        return data;
    } catch (err) {
        console.error('Fetch failed:', err);
        return null;
    }
}

export default {};
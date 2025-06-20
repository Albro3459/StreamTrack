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
            console.error(`Error getting user data ${result.status}: ${text}`);
            return null;
        }

        const data: UserData = await result.json();
        return data;
    } catch (err) {
        console.error('Fetch user data failed:', err);
        return null;
    }
}

export const createUser = async (token: string) => {
    try {
        const url = DataAPIURL + "API/User/Create";

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error creating user ${result.status}: ${text}`);
            return null;
        }

    } catch (err) {
        console.error('Create user failed:', err);
    }
}

export default {};
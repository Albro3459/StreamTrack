import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { UpdateUserProfileData, UserData } from "../../types/dataTypes";

export const getUserData = async (token: string): Promise<UserData | null> => {
    try {
        const url = DataAPIURL + "API/User/Get";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
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
        console.log(data);
        
        return data;
    } catch (err) {
        console.error('Fetch user data failed:', err);
        return null;
    }
};

export const createUser = async (token: string | null) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + "API/User/Create";

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
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
};

export const updateUserProfile = async (token: string | null, firstName: string | null, lastName: string | null, genres: Set<string>, streamingServices: Set<string>) : Promise<UserData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + "API/User/Update";

        const body: UpdateUserProfileData = {
            ...(firstName && { FirstName: firstName }),
            ...(lastName && { LastName: lastName }),
            Genres: Array.from(genres),
            StreamingServices: Array.from(streamingServices)
        }

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
            console.error(`Error creating user ${result.status}: ${text}`);
            return null;
        }

        const data: UserData = await result.json();
        console.log(data);
        
        return data;

    } catch (err) {
        console.error('Create user failed:', err);
    }
};

export default {};
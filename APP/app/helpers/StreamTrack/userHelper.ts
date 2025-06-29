import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { ContentPartialData, UpdateUserProfileData, UserMinimalData } from "../../types/dataTypes";

export const checkIfUserExists = async (token: string): Promise<boolean> => {
    try {
        const url = DataAPIURL + "API/User/Check";

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
            console.warn(`Error getting user data ${result.status}: ${text}`);
            return false;
        }
        else {
            return true;
        }

    } catch (err) {
        console.error('Fetch user data failed:', err);
        return false;
    }
};

export const getUserMinimalData = async (token: string): Promise<UserMinimalData | null> => {
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

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error getting user minimal data ${result.status}: ${text}`);
            return null;
        }

        const data: UserMinimalData = await result.json();
        
        return data;
    } catch (err) {
        console.error('Fetch user minimal data failed:', err);
        return null;
    }
};

export const getUserContents = async (token: string): Promise<ContentPartialData[] | null> => {
    try {
        const url = DataAPIURL + "API/User/GetContents";

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
            console.error(`Error getting user contents ${result.status}: ${text}`);
            return null;
        }

        const data: ContentPartialData[] = await result.json();
        
        return data;
    } catch (err) {
        console.error('Fetch user contents failed:', err);
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

export const updateUserProfile = async (token: string | null, firstName: string | null, lastName: string | null, genres: Set<string>, streamingServices: Set<string>) : Promise<UserMinimalData | null> => {
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
            console.error(`Error updating user ${result.status}: ${text}`);
            return null;
        }

        const data: UserMinimalData = await result.json();
                
        return data;

    } catch (err) {
        console.error('Updating user failed:', err);
    }
};

export default {};
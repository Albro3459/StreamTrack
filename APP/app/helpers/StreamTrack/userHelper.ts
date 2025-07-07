"use client";

import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { ContentPartialData, UpdateUserProfileData, UserMinimalData } from "../../types/dataTypes";
import { Alert } from "@/app/components/alertMessageComponent";
import { auth, signOut } from "@/firebaseConfig";

export const checkIfUserExists = async (token: string,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
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
            // Don't need to check unauthorized here because caller will handle it
            const text = await result.text();
            console.warn(`Error getting user data ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('User does not exist'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return false;
        }
        else {
            return true;
        }

    } catch (err) {
        console.warn('Fetch user data failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Fetch user data failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export const getUserMinimalData = async (token: string,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<UserMinimalData | null> => {
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                return null;
            }
            const text = await result.text();
            console.warn(`Error getting user minimal data ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting user minimal data'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: UserMinimalData = await result.json();
        
        return data;
    } catch (err) {
        console.warn('Fetch user minimal data failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Fetch user minimal data failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const getUserContents = async (token: string,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<ContentPartialData[] | null> => {
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                return null;
            }
            const text = await result.text();
            console.warn(`Error getting user contents ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting user contents'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: ContentPartialData[] = await result.json();
        
        return data;
    } catch (err) {
        console.warn('Fetch user contents failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Fetch user contents failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const createUser = async (token: string | null,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                return null;
            }
            const text = await result.text();
            console.warn(`Error creating user ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error creating user'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Create user failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Create user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export const updateUserProfile = async (token: string | null, firstName: string | null, lastName: string | null, 
                                        genres: Set<string>, streamingServices: Set<string>,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) : Promise<UserMinimalData | null> => {
    try {
        if (!token) return null;    

        const url = DataAPIURL + "API/User/Update";

        const body: UpdateUserProfileData = {
            ...(firstName && { FirstName: firstName?.trim() }),
            ...(lastName && { LastName: lastName?.trim() }),
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                return null;
            }
            const text = await result.text();
            console.warn(`Error updating user ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error updating user'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: UserMinimalData = await result.json();
                
        return data;

    } catch (err) {
        console.warn('Updating user failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Updating user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export default {};
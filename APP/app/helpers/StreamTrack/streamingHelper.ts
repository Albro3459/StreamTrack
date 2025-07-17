"use client";

import { Alert } from "../../../app/components/alertMessageComponent";
import { StreamingServiceData } from "../../../app/types/dataTypes";
import { DataAPIURL } from "../../../secrets/DataAPIUrl";
import { auth, signOut } from "../../../firebaseConfig";
import { Router } from "expo-router";

export const getStreamingServiceData = async (router: Router, token: string,
                                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<StreamingServiceData[] | null> => {
    try {
        const url = DataAPIURL + "API/Streaming/GetMain";

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
                router.replace({
                    pathname: '/LoginPage',
                    params: { unauthorized: 1 },
                });
                return null;
            }
            const text = await result.text();
            console.warn(`Error getting streaming data ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting streaming data'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: StreamingServiceData[] = await result.json();
        return data;
    } catch (err) {
        console.warn('Fetch streaming data failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Fetch streaming data failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export default {};
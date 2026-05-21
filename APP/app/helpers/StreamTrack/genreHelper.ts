"use client";

import { GenreData } from "../../types/dataTypes";
import { Alert } from "../../../app/components/alertMessageComponent";
import { secrets } from "../../../firebaseConfig";
import { Router } from "expo-router";
import { authHeader } from "./authApiHelper";

export const getGenreData = async (router: Router, token?: string | null,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<GenreData[] | null> => {
    try {
        const url = secrets.dataAPIURL + "API/Genre/GetMain";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                ...authHeader(token)
            }
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.warn(`Error getting genre data ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting genre data'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: GenreData[] = await result.json();
        return data;
    } catch (err) {
        console.warn('Fetch genre data failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Fetch genre data failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export default {};

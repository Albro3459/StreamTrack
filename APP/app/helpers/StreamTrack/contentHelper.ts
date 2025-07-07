"use client";

import { Alert } from "@/app/components/alertMessageComponent";
import { ContentInfoData, ContentPartialData, ContentRequestData, ContentSimpleData, PopularContentData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";

export const contentSimpleToPartial = (simple: ContentSimpleData): ContentPartialData => {
    return {
        tmdbID: simple.tmdbID,
        title: simple.title,
        overview: simple.overview,
        rating: simple.rating,
        releaseYear: simple.releaseYear,
        verticalPoster: simple.verticalPoster,
        horizontalPoster: simple.horizontalPoster
    };
};

export const getContentInfo = async (token: string, content: ContentRequestData,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<ContentInfoData | null> => {
    try {
        const url = DataAPIURL + "API/Content/Info";

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(content)
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.warn(`Error getting content details ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting content details'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: ContentInfoData = await result.json();
        
        return data;
    } catch (err) {
        console.warn('Get content details failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Get content details failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const getPopularContent = async (token: string,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) : Promise<PopularContentData | null> => {
    try {
        const url = DataAPIURL + "API/Content/Popular";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.warn(`Error getting popular content ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error getting popular content'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: PopularContentData = await result.json();
        
        return data;
    } catch (err) {
        console.warn('Get popular content failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Get popular content failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export default {};
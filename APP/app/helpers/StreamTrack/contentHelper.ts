"use client";

import { Alert } from "../../../app/components/alertMessageComponent";
import { ContentData, ContentInfoData, ContentPartialData, ContentRequestData, ContentSimpleData, PopularContentData } from "../../../app/types/dataTypes";
import { DataAPIURL } from "../../../secrets/DataAPIUrl";
import { auth, signOut } from "../../../firebaseConfig";
import { Router } from "expo-router";

const missingVerticalPoster: number = require('@/assets/images/MissingVerticalPoster.png') || "";
const missingHorizontalPoster: number = require('@/assets/images/MissingHorizontalPoster.png') || "";

export enum POSTER {
    VERTICAL = "vertical",
    LARGE_VERTICAL = "large_vertical",
    HORIZONTAL = "horizontal",
    EMPTY = "empty"
};

export type PosterURI = {
    uri: string;
};

// Returns regular vertical poster first unless a certain poster is specified
export const getPoster = (content: ContentPartialData | ContentSimpleData | ContentData | null, ...posterTypes: POSTER[]) : PosterURI | number => {
    if (posterTypes.includes(POSTER.EMPTY)) {
        if (posterTypes.includes(POSTER.VERTICAL)) {
            return missingVerticalPoster;
        }
        else if (posterTypes.includes(POSTER.LARGE_VERTICAL)) {
            return missingVerticalPoster;
        }
        else if (posterTypes.includes(POSTER.HORIZONTAL)) {
            return missingHorizontalPoster;
        } else {
            return missingVerticalPoster;
        }
    }
    else if (posterTypes.includes(POSTER.VERTICAL)) {
        return content?.verticalPoster ? { uri: content?.verticalPoster } : missingVerticalPoster;
    }
    else if (posterTypes.includes(POSTER.LARGE_VERTICAL)) {
        return content?.largeVerticalPoster ? { uri: content?.largeVerticalPoster } : missingVerticalPoster;
    }
    else if (posterTypes.includes(POSTER.HORIZONTAL)) {
        return content?.horizontalPoster ? { uri: content?.horizontalPoster } : missingVerticalPoster;
    }
    
    else if (content?.verticalPoster) {
        return { uri: content?.verticalPoster };
    }
    else if (content?.largeVerticalPoster) {
        return { uri: content?.largeVerticalPoster };
    }
    else if (content?.horizontalPoster) {
        return { uri: content?.horizontalPoster };
    } else {
        return missingVerticalPoster;
    }
}

export const contentSimpleToPartial = (simple: ContentSimpleData): ContentPartialData => {
    return {
        tmdbID: simple.tmdbID,
        title: simple.title,
        overview: simple.overview,
        rating: simple.rating,
        releaseYear: simple.releaseYear,
        verticalPoster: simple.verticalPoster,
        largeVerticalPoster: simple.largeVerticalPoster,
        horizontalPoster: simple.horizontalPoster
    };
};

export const getContentInfo = async (router: Router, token: string, content: ContentRequestData,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>,
                                        shouldRefresh: boolean = false,
): Promise<ContentInfoData | null> => {
    try {
        const url = DataAPIURL + "API/Content/Info" + (shouldRefresh ? "?shouldRefresh=true" : "");

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
            console.warn(`Error getting content details ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Unfortunately, streaming information is currently unavailable for this movie/show'); 
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

export const getPopularContent = async (router: Router, token: string,
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
"use client";

import { Router } from "expo-router";
import { Alert } from "../components/alertMessageComponent";
import { clearContentCache } from "../stores/contentCacheStore";
import { clearGenreData, fetchGenreData } from "../stores/genreDataStore";
import { clearPopularContent, fetchPopularContent } from "../stores/popularContentStore";
import { clearStreamingServiceData, fetchStreamingServiceData } from "../stores/streamingServiceDataStore";
import { clearUserData, fetchUserData } from "../stores/userDataStore";

export enum CACHE {
    ALL,
    USER,
    POPULAR,
    GENRE,
    STREAMING
};

export const FetchCache = (router: Router, token: string,
                            setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                            setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>,
                            ...data: CACHE[]
) => {
    if (!token) return;

    if (data.length === 0 || data.includes(CACHE.ALL)) {
        fetchUserData(router, token, setAlertMessageFunc, setAlertTypeFunc);
        fetchPopularContent(router, token, setAlertMessageFunc, setAlertTypeFunc);
        fetchGenreData(router, token, setAlertMessageFunc, setAlertTypeFunc);
        fetchStreamingServiceData(router, token, setAlertMessageFunc, setAlertTypeFunc);
        return;
    }

    if (data.includes(CACHE.USER)) {
        fetchUserData(router, token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.POPULAR)) {
        fetchPopularContent(router, token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.GENRE)) {
        fetchGenreData(router, token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.STREAMING)) {
        fetchStreamingServiceData(router, token, setAlertMessageFunc, setAlertTypeFunc);
    }
};


export const ClearCache = (...data: CACHE[]) => {

    if (data.length === 0 || data.includes(CACHE.ALL)) {
        clearUserData(); clearContentCache(); // These are both for the user
        clearPopularContent();
        clearGenreData();
        clearStreamingServiceData();
        return;
    }

    if (data.includes(CACHE.USER)) {
        clearUserData();
        clearContentCache();
    }
    if (data.includes(CACHE.POPULAR)) {
        clearPopularContent();
    }
    if (data.includes(CACHE.GENRE)) {
        clearGenreData();
    }
    if (data.includes(CACHE.STREAMING)) {
        clearStreamingServiceData();
    }
};

export default {};
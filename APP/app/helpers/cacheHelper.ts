"use client";

import { Alert } from "../components/alertMessageComponent";
import { clearContentCache } from "../stores/contentDataStore";
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

export const FetchCache = (token: string,
                            setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                            setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>,
                            ...data: CACHE[]
) => {
    if (!token) return;

    if (data.length === 0 || data.includes(CACHE.ALL)) {
        fetchUserData(token, setAlertMessageFunc, setAlertTypeFunc);
        fetchPopularContent(token, setAlertMessageFunc, setAlertTypeFunc);
        fetchGenreData(token, setAlertMessageFunc, setAlertTypeFunc);
        fetchStreamingServiceData(token, setAlertMessageFunc, setAlertTypeFunc);
        return;
    }

    if (data.includes(CACHE.USER)) {
        fetchUserData(token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.POPULAR)) {
        fetchPopularContent(token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.GENRE)) {
        fetchGenreData(token, setAlertMessageFunc, setAlertTypeFunc);
    }
    if (data.includes(CACHE.STREAMING)) {
        fetchStreamingServiceData(token, setAlertMessageFunc, setAlertTypeFunc);
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
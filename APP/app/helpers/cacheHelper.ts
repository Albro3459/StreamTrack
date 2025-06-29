import { clearContentCache } from "../stores/contentDataStore";
import { clearGenreData, fetchGenreData } from "../stores/genreDataStore";
import { clearStreamingServiceData, fetchStreamingServiceData } from "../stores/streamingServiceDataStore";
import { clearUserData, fetchUserData } from "../stores/userDataStore";

export enum CACHE {
    ALL,
    USER,
    GENRE,
    STREAMING
};

export const FetchCache = (token: string, ...data: CACHE[]) => {
    if (!token) return;

    if (data.length === 0 || data.includes(CACHE.ALL)) {
        fetchUserData(token);
        fetchGenreData(token);
        fetchStreamingServiceData(token);
        return;
    }

    if (data.includes(CACHE.USER)) {
        fetchUserData(token);
    }
    if (data.includes(CACHE.GENRE)) {
        fetchGenreData(token);
    }
    if (data.includes(CACHE.STREAMING)) {
        fetchStreamingServiceData(token);
    }
};


export const ClearCache = (...data: CACHE[]) => {

    if (data.length === 0 || data.includes(CACHE.ALL)) {
        clearUserData(); clearContentCache();
        clearGenreData();
        clearStreamingServiceData();
        return;
    }

    if (data.includes(CACHE.USER)) {
        clearUserData();
        clearContentCache();
    }
    if (data.includes(CACHE.GENRE)) {
        clearGenreData();
    }
    if (data.includes(CACHE.STREAMING)) {
        clearStreamingServiceData();
    }
};

export default {};
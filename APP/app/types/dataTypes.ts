"use client";

import { SHOW_TYPE } from "./contentType";

// Types I used to send and receive from my StreamTrack API

// Send
export type ListsUpdateData = {
    tmdbID: string;
    AddToLists: string[];
    RemoveFromLists: string[];
};

export type UpdateUserProfileData = {
    FirstName?: string;
    LastName?: string;
    Genres?: string[];
    StreamingServices?: string[];
};

// Used to get content details on Info Page
export type ContentRequestData = {
    tmdbID: string;
    VerticalPoster: string | null;
    HorizontalPoster: string | null;
};

// Receive
export type UserData = {
    user: UserMinimalData;
    contents: ContentPartialData[];
};

export type UserMinimalData = {
    email: string;
    firstName: string;
    lastName: string;
    listsOwned: ListMinimalData[];
    listsSharedWithMe: ListMinimalData[];
    listsSharedWithOthers: ListMinimalData[];
    genreNames: string[];
    streamingServices: StreamingServiceData[];
};

export type ListMinimalData = {
    isOwner: boolean;
    listName: string;
    tmdbIDs: string[];
    // permission: string;
};

export type ListData = {
    isOwner: boolean;
    listName: string;
    contents: ContentData[];
    // permission: string;
};

export type PopularContentData = {
    carousel: ContentSimpleData[];
    main: Record<string, ContentSimpleData[]>;
}

// Landing Page
export type ContentSimpleData = {
    tmdbID: string;
    title: string;
    overview: string;
    showType: SHOW_TYPE;
    rating: number;
    releaseYear: number;
    genreNames: string[];
    streamingServiceNames: string[];
    verticalPoster: string;
    horizontalPoster: string;
};

// Search and Library pages
export type ContentPartialData = {
    tmdbID: string;
    title: string;
    overview: string;
    rating: number;
    releaseYear: number;
    verticalPoster: string | null;
    horizontalPoster: string | null;
};

export type ContentData = {
    tmdbID: string;
    title: string;
    overview: string;
    releaseYear: number;
    rapidID: string;
    imdbID: string;
    showType: SHOW_TYPE;
    genres: GenreData[];
    cast: string[];
    directors: string[];
    rating: number;
    runtime?: number | null;
    seasonCount?: number | null;
    episodeCount?: number | null;
    streamingOptions: StreamingOptionData[];
    verticalPoster: string;
    horizontalPoster: string;
};


export type GenreData = {
    name: string;
}

export type StreamingServiceData = {
    name: string;
    lightLogo: string;
    darkLogo: string;
};

export type StreamingOptionData = {
    content?: ContentData; // Nullable so when sending content we don't have circular references
    streamingService: StreamingServiceData;
    type: string;
    price?: string | null;
    deepLink: string;
};

export default {};
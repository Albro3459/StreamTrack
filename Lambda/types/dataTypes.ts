import { TMDB_MEDIA_TYPE } from "./tmdbType";

// Send
export type ListsUpdateData = {
    ContentID: string;
    AddToLists: string[];
    RemoveFromLists: string[];
};

export type UpdateUserProfileData = {
    Email?: string;
    FirstName?: string;
    LastName?: string;
    Genres?: string[];
    StreamingServices?: string[];
};

// Receive
export type UserData = {
    email: string;
    firstName: string;
    lastName: string;
    listsOwned: ListData[];
    listsSharedWithMe: ListData[];
    listsSharedWithOthers: ListData[];
    genres: GenreData[];
    streamingServices: StreamingServiceData[];
};


export type ListData = {
    isOwner: boolean;
    listName: string;
    contents: ContentData[];
    // permission: string;
};


export type ContentData = {
    contentID: string;
    title: string;
    overview: string;
    releaseYear: number;
    imdb_ID: string;
    tmdb_ID: string;
    showType: TMDB_MEDIA_TYPE;
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
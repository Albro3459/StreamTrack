export type UpdateUserProfileData = {
    Email?: string;
    FirstName?: string;
    LastName?: string;
    Genres?: string[];
    StreamingServices?: string[];
};

export type UserData = {
    email: string;
    firstName: string;
    lastName: string;
    ownedLists: ListData[];
    listShares: ListData[];
    genres: GenreData[];
    streamingServices: StreamingServiceData[];
};


export type ListData = {
    isOwner: boolean;
    listName: string;
    contents: ContentData[];
};


export type ContentData = {
    contentID: string;
    title: string;
    overview: string;
    releaseYear: number;
    imdb_ID: string;
    tmdb_ID: string;
    showType: string;
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
    logo: string;
};

export type StreamingOptionData = {
    content: ContentData;
    streamingService: StreamingServiceData;
    type: string;
    price?: string | null;
    deepLink: string;
};

export default {};
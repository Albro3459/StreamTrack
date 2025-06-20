export type UserData = {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    genres: GenreData[] | null;
    // streamingServices: StreamingService[] | null;
};

export type GenreData = {
    name: string;
}

export default {};
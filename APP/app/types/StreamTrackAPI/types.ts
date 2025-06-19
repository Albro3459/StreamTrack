export type UserData = {
    email: string;
    firstName: string;
    lastName: string;
    genres: GenreData[];
};

export type GenreData = {
    name: string;
}

export default {};
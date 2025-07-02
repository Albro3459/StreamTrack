export enum SHOW_TYPE {
    MOVIE = "movie",
    SERIES = "series"
}

export enum GENRE {
    ACTION = "action",
    ADVENTURE = "adventure",
    ANIMATION = "animation",
    COMEDY = "comedy",
    CRIME = "crime",
    DOCUMENTARY = "documentary",
    DRAMA = "drama",
    FAMILY = "family",
    FANTASY = "fantasy",
    HISTORY = "history",
    HORROR = "horror",
    MUSICAL = "music",
    BIOGRAPHY = "biography",
    MYSTERY = "mystery",
    NEWS = "news",
    REALITY = "reality",
    ROMANCE = "romance",
    SCIFI = "scifi",
    TALK = "talk",
    THRILLER = "thriller",
    WAR = "war",
    WESTERN = "western"
}

export enum SERVICE {
    NETFLIX = "netflix",
    HULU = "hulu",
    HBO = "hbo",
    PRIME = "prime",
    APPLE = "apple",
    DISNEY = "disney",
    PEACOCK = "peacock",
    PARAMOUNT = "paramount",
    DISCOVERY = "discovery",
    STARZ = "starz",
    TUBI = "tubi"
}

export enum ORDER_BY {
    ORIGINAL_TITLE = "original_title",
    RELEASE_DATE = "release_date",
    RATING = "rating",
    POPULARITY_ALLTIME = "popularity_alltime",
    POPULARITY_1YEAR = "popularity_1year", // DESC
    POPULARITY_1MONTH = "popularity_1month",
    POPULARITY_1WEEK = "popularity_1week" // MUST DO ASC (it's broken)
}

export enum ORDER_DIRECTION {
    ASC = "asc",
    DESC = "desc"
}

// export enum PAID_OPTION {
//     FREE = "free",
//     SUBSCRIPTION = "subscription",
//     RENT = "rent",
//     BUY = "buy"
// }
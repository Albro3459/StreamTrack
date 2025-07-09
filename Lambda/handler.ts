import { APIGatewayEvent, Context } from "aws-lambda";

import { fetchByServiceAndGenre } from "./helpers/contentAPIHelper";
import { updatePopularContents } from "./helpers/streamTrackAPIHelper";
import { getFirebaseToken } from "./helpers/firebaseHelper";
import { ContentData } from "./types/dataTypes";
import { GENRE, ORDER_BY, ORDER_DIRECTION, SERVICE, SHOW_TYPE } from "./types/contentFilterOptions";

// OLD Cron Schedule: (Min: 0, Hour: 0, Days of the month: (1,5,9,13,17,21,25,29 skips when no 29th), Month: * any, Day of week: ? use day of month, Year: 2025 just in case)
// cron(0 0 1,5,9,13,17,21,25,29 * 7 2025)

// Cron Schedule: (Min: 0, Hour: 0, Days of the month: ? none specified, Month: * any, Day of week: 0 Sunday, Year: 2025 just in case)
// corn(0, 0, ? * 0 2025)

// export const handler = async (event: APIGatewayEvent, context: Context) => {

// }

const RATING_CUTOFF: number = 70;
const genres: GENRE[] = [GENRE.ACTION, GENRE.COMEDY, GENRE.DRAMA, GENRE.THRILLER, GENRE.SCIFI, GENRE.ROMANCE, GENRE.HORROR, GENRE.WESTERN];
const services: SERVICE[] = [SERVICE.NETFLIX, SERVICE.HULU, SERVICE.HBO, SERVICE.PRIME, SERVICE.DISNEY, SERVICE.APPLE, SERVICE.PARAMOUNT, SERVICE.PEACOCK];

const order_by: ORDER_BY = ORDER_BY.POPULARITY_1WEEK;
const order_direction: ORDER_DIRECTION = ORDER_DIRECTION.ASC;

// 8 genres x 8 services = 64 calls x 2 for movies and shows = 128 total calls

// Maybe add pulls from shows/top https://docs.movieofthenight.com/resource/shows#get-top-shows

export const handler = async () => {

    const token: string | null = await getFirebaseToken();

    let requestCount = 0, itemCount = 0, totalRequests = genres.length * services.length * Object.values(SHOW_TYPE).length;

    const uniqueContentMap = new Map<string, ContentData>();

    for (const service of services) {
        for (const genre of genres) {
            for (const show_type of Object.values(SHOW_TYPE)) {
                try {
                    const results: ContentData[] | null = await fetchByServiceAndGenre(RATING_CUTOFF, service, genre, show_type, order_by, order_direction);
                    if (results === null || results === undefined) throw "failed to fetch posters";
                    for (const item of results) {
                        uniqueContentMap.set(item.tmdbID, item);
                    }
                    requestCount++;
                    itemCount += results.length;
                    console.log("Current API Request Count: " + requestCount + " / " + totalRequests);
                    console.log("Content count in this request that passed the rating cutoff: " + results.length);
                    console.log("Content IDs just added: " + JSON.stringify(results.map(c => c.tmdbID)) + "\n");
                    console.log(`Request Details: {Service: ${service} | Genre: ${genre} | Type: ${show_type}}`);
                } catch (error) {
                    console.error(`Failed for service=${service}, genre=${genre}, showType=${show_type}, order_by=${order_by}, order_direction=${order_direction}:`, error);
                    return { status: 400, count: requestCount } // crash out
                }
            }
        }
    }

    console.log("TOTAL API REQUEST COUNT: " + requestCount);
    console.log("TOTAL ITEM COUNT: " + itemCount);

    const dedupedContents: ContentData[] = Array.from(uniqueContentMap.values());

    const result: number | null = await updatePopularContents(token, dedupedContents);
    if (!result) return { status: 400, count: requestCount }
    return { status: result, count: requestCount }
};

// Only needed for script. NOT when running on AWS Lambda
handler();
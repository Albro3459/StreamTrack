import { APIGatewayEvent, Context } from "aws-lambda";

import { fetchByServiceAndGenre } from "./helpers/contentAPIHelper";
import { updatePopularContents } from "./helpers/streamTrackAPIHelper";
import { getFirebaseToken } from "./helpers/firebaseHelper";
import { ContentData } from "./types/dataTypes";
import { GENRE, ORDER_BY, ORDER_DIRECTION, SERVICE, SHOW_TYPE } from "./types/contentFilterOptions";
import { getAllSecrets } from "./helpers/AWSSecretsHelper";
import { AWSSecrets } from "./types/AWSSecretsType";

// Cron Schedule: (Min: 59, Hour: 23, Days of the month: ? none specified, Month: * any, Day of week: SUN Sunday, Year: 2025 just in case)
// cron(59, 23, ? * SUN 2025)

const RATING_CUTOFF: number = 70;
const genres: GENRE[] = [GENRE.ACTION, GENRE.COMEDY, GENRE.DOCUMENTARY, GENRE.DRAMA, GENRE.THRILLER, GENRE.SCIFI, GENRE.ROMANCE, GENRE.HORROR, GENRE.WESTERN];
const services: SERVICE[] = [SERVICE.NETFLIX, SERVICE.HULU, SERVICE.HBO, SERVICE.PRIME, SERVICE.DISNEY, SERVICE.APPLE, SERVICE.PARAMOUNT, SERVICE.PEACOCK];
const order_by: ORDER_BY = ORDER_BY.POPULARITY_1WEEK;
const order_direction: ORDER_DIRECTION = ORDER_DIRECTION.ASC;

// 9 genres x 8 services = 72 calls x 2 for movies and shows = 144 total calls

// Maybe add pulls from shows/top https://docs.movieofthenight.com/resource/shows#get-top-shows

export const handler = async (event: APIGatewayEvent, context: Context) => {

    const secrets: AWSSecrets = await getAllSecrets();

    const token: string | null = await getFirebaseToken(secrets);

    let itemCount: number = 0, requestCount: number = 0, totalRequests: number = genres.length * services.length * Object.values(SHOW_TYPE).length;

    const uniqueContentMap = new Map<string, ContentData>();

    for (const service of services) {
        for (const genre of genres) {
            for (const show_type of Object.values(SHOW_TYPE)) {
                try {
                    const results: ContentData[] | null = await fetchByServiceAndGenre(secrets.RapidAPIKey_Lambda, secrets.TMDBBearerToken, RATING_CUTOFF, service, genre, show_type, order_by, order_direction);
                    if (results === null || results === undefined) throw "failed to fetch posters";
                    for (const item of results) {
                        uniqueContentMap.set(item.tmdbID, item);
                    }
                    itemCount += results.length;
                    requestCount++;
                    console.log("Current API Request Count: " + requestCount + " / " + totalRequests);
                    console.log("Content count in this request that passed the rating cutoff: " + results.length);
                    console.log("Content IDs just added: " + JSON.stringify(results.map(c => c.tmdbID)) + "\n");
                    console.log(`Request Details: {Service: ${service} | Genre: ${genre} | Type: ${show_type}}`);
                } catch (error) {
                    console.error(`Failed for service=${service}, genre=${genre}, showType=${show_type}, order_by=${order_by}, order_direction=${order_direction}:`, error);
                    return { status: 400, requestCount: requestCount, itemCount: itemCount } // crash out
                }
            }
        }
    }

    const dedupedContents: ContentData[] = Array.from(uniqueContentMap.values());

    const filteredContents: ContentData[] = dedupedContents.filter(c => {
        const valid =
            !!c.verticalPoster?.trim() &&
            !!c.largeVerticalPoster?.trim() &&
            !!c.horizontalPoster?.trim();

        if (!valid) {
            console.warn("Missing poster(s) for TMDB ID:", c.tmdbID, {
                verticalPoster: c.verticalPoster,
                largeVerticalPoster: c.largeVerticalPoster,
                horizontalPoster: c.horizontalPoster
            });
        }
        return valid;
    });

    itemCount = filteredContents.length;
    console.log("TOTAL API REQUEST COUNT: " + requestCount);
    console.log("TOTAL ITEM COUNT: " + itemCount);
    console.log("TOTAL FILTERED OUT CONTENTS COUNT: " + (dedupedContents.length - itemCount));

    const result: number | null = await updatePopularContents(token, filteredContents);
    if (!result) return { status: 400, requestCount: requestCount, itemCount: itemCount }
    return { status: result, requestCount: requestCount, itemCount: itemCount }
};

// Only needed for script. NOT when running on AWS Lambda
// handler();
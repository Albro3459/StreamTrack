import { APIGatewayEvent, Context } from "aws-lambda";

import { fetchByServiceAndGenre } from "./helpers/contentAPIHelper";
import { bulkUpdateContents } from "./helpers/streamTrackAPIHelper";
import { getFirebaseToken } from "./helpers/firebaseHelper";
import { ContentData } from "./types/dataTypes";

// export const handler = async (event: APIGatewayEvent, context: Context) => {

// }

// const GENRES = ["action", "comedy", "drama", "thriller", "scifi", "romance", "horror", "western"];
// const SERVICES = ["netflix", "hulu", "hbo", "prime", "disney", "apple", "paramount", "peacock"];
const GENRES = ["action"];
const SERVICES = ["netflix"];

export const handler = async () => {

    const uniqueContentMap = new Map<string, ContentData>();

    for (const service of SERVICES) {
        for (const genre of GENRES) {
            try {
                const results: ContentData[] = await fetchByServiceAndGenre(service, genre); // Add getting posters from TMDB next
                for (const item of results) {
                    uniqueContentMap.set(item.contentID, item);
                }
            } catch (error) {
                console.error(`Failed for service=${service}, genre=${genre}:`, error);
                throw error;
            }
        }
    }

    const dedupedContents: ContentData[] = Array.from(uniqueContentMap.values());

    // console.log(JSON.stringify(dedupedContents));

    const token: string | null = await getFirebaseToken();
    const result: number | null = await bulkUpdateContents(token, dedupedContents);
    if (!result) return { status: 400 }
    return { status: result }
}

handler();
import { StreamingServiceData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";

export const getStreamingServiceData = async (token: string): Promise<StreamingServiceData[] | null> => {
    try {
        const url = DataAPIURL + "API/Streaming/Get";

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error getting streaming data ${result.status}: ${text}`);
            return null;
        }

        const data: StreamingServiceData[] = await result.json();
        return data;
    } catch (err) {
        console.error('Fetch streaming data failed:', err);
        return null;
    }
};

export default {};
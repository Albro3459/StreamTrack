import { Alert } from "../../../app/components/alertMessageComponent";
import { ContentPartialData } from "../../../app/types/dataTypes";
import { secrets } from "../../../firebaseConfig";
import { Router } from "expo-router";
import { authHeader } from "./authRequiredHelper";

export const searchTMDB = async (router: Router, token: string | null, keyword: string,
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>,
): Promise<ContentPartialData[]> => {

    keyword = keyword?.trim() ?? "";
    if (keyword.length === 0) {
        console.warn(`Error: Empty keyword in search`);
        if (setAlertMessageFunc) setAlertMessageFunc('Error: Empty keyword in search'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return [];
    }
    try {
        const url = secrets.dataAPIURL + "API/Content/Search?keyword=" + encodeURIComponent(keyword);

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                ...authHeader(token)
            },
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.warn(`Error searching TMDB ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error searching'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return [];
        }

        const data: ContentPartialData[] = await result.json();
        
        return data;
    } catch (err) {
        console.warn('Search TMDB failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Search failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return [];
    }
};

export default {};

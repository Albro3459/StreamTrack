import { PosterContent } from "@/app/types/contentType";
import { ContentData, ListData, ListsUpdateData, UserData } from "@/app/types/dataTypes";
import { RapidAPIGetByRapidID, RapidAPIGetByTMDBID } from "../contentAPIHelper";
import { MEDIA_TYPE } from "@/app/types/tmdbType";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { convertPosterContentToContentData } from "./contentHelper";
import { auth } from "@/firebaseConfig";
import { User } from "firebase/auth";

export const isItemInList = (lists: ListData[], listName: string, contentID: string) => {
    const list: ListData = lists.find(l => l.listName === listName);
    if (!list) return false;

    return list.contents.some(c => c.contentID === contentID);
};

// export const updateListsWithContent = async (lists: ListData[], wantedLists: Set<string>, contentID: string) : Promise<UserData | null> => {
//     console.log(wantedLists);
//     const addToLists: string[] = [];
//     const removeFromLists: string[] = [];

//     for (const list of lists) {
//         const hasContent = list.contents.some(c => c.contentID === contentID);
//         const shouldHave = wantedLists.has(list.listName);

//         if (shouldHave && !hasContent) {
//             addToLists.push(list.listName);
//         } else if (!shouldHave && hasContent) {
//             removeFromLists.push(list.listName);
//         }
//     }

//     const user: User | null = await auth.currentUser;
//     if (!user) return;
//     const token = await user.getIdToken();

//     return await updateListsForContent(token, contentID, addToLists, removeFromLists);

// };

// export const updateListsForContent = async (token: string, contentID: string, addToLists: string[], removeFromLists: string[]) : Promise<UserData | null> => {
//     try {
//         if (!token) return null;

//         const url = DataAPIURL + `API/List/Update`;

//         console.log(url);

//         const body: ListsUpdateData = {
//             ContentID: contentID,
//             AddToLists: addToLists,
//             RemoveFromLists: removeFromLists,
//         };

//         console.log(body);
        
//         const options = {
//             method: 'POST',
//             headers: {
//                 accept: 'application/json',
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`
//             },
//             body: JSON.stringify(body)
//         };

//         // const result = await fetch(url, options);

//         // if (!result.ok) {
//         //     const text = await result.text();
//         //     console.error(`Error updating lists ${result.status}: ${text}`);
//         //     return null;
//         // }

//         // const data: UserData = await result.json();
        
//         // return data;

//     } catch (err) {
//         console.error('Updating lists failed:', err);
//     }
// }

export const addPosterContentToUserList = async (token: string | null, listName: string, posterContent: PosterContent) => {
    return await addContentToUserList(token, listName, convertPosterContentToContentData(posterContent));
};

export const addContentToUserList = async (token: string | null, listName: string, content: ContentData) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Add`;
        
        // console.log(JSON.stringify(body, null, 4));
        
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(content)
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error adding content to list ${result.status}: ${text}`);
            return null;
        }

        const data: ListData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Adding content to list failed:', err);
    }
};

export const removeContentFromUserList = async (token: string | null, listName: string, contentID: string) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Remove/${contentID}`;

        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error removing content from list ${result.status}: ${text}`);
            return null;
        }

        const data: ListData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Removing content from list failed:', err);
    }
};

export const createNewUserList = async (token: string | null, listName: string) => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Create`;
                
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        };

        const result = await fetch(url, options);

        if (!result.ok) {
            const text = await result.text();
            console.error(`Error creating new list ${result.status}: ${text}`);
            return null;
        }

        const data: ListData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Creating new list failed:', err);
    }
};

export default {};
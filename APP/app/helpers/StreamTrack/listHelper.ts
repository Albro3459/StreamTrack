import { ContentData, ListData, UserData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "@/app/stores/userDataStore";
import { RapidAPIGetByTMDBID } from "../contentAPIHelper";
import { Movie } from "@/app/SearchPage";
import { CACHE, FetchCache } from "../cacheHelper";

export const FAVORITE_TAB = "Favorites";

export const isItemInList = (lists: ListData[], listName: string, contentID: string) => {
    const list: ListData = lists.find(l => l.listName === listName);
    if (!list) return false;

    return list.contents.some(c => c.contentID === contentID);
};

export const isTMDBItemInList = (lists: ListData[] | PartialListData[], listName: string, fullTMDBID: string): boolean => {
    const list: ListData | PartialListData = lists.find(l => l.listName === listName);
    if (!list) return false;
    return list.contents.some(c => c.tmdb_ID === fullTMDBID);
};

// Sorts the lists so just favorite tab is first. That's literally it. Used on the library page to keep the heart on the left
export const sortLists = <T extends { listName: string }>(lists: T[]): T[] => {
    return [...lists].sort((a, b) => {
        if (a.listName === FAVORITE_TAB) return -1;
        if (b.listName === FAVORITE_TAB) return 1;
        return 0;
    });
};

export type PartialListData = {
    isOwner: boolean;
    listName: string;
    contents: ContentData[] | Partial<ContentData>[];
    // permission: string;
};

export const delayedMoveTMDBItemToList = async (movie: Movie, listName: string, lists: PartialListData[], 
                                setLists: React.Dispatch<React.SetStateAction<PartialListData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible: React.Dispatch<React.SetStateAction<boolean>>        
) => {
    // Responds with the updated list immediately, but it updates the lists behind the scenes! (Possible race conditions but it makes for a faster UI)
        // The commit before this possible race condition is 620e70d81d65cf458de2f1fc757b31544dd969f7

    // Only works for user owned lists for now

    try {
        setIsLoading(true);
        let list: PartialListData = lists.find(l => l.listName === listName);
        if (!list) {
            return;
        }
        const user: User | null = auth.currentUser;
        if (!user) {
            return;
        }
        const fakeContent: Partial<ContentData> = {
            tmdb_ID: movie.fullTMDBID
        };
        
        let contents: Partial<ContentData>[] = [];
        if (list.contents.some(c => c.tmdb_ID === movie.fullTMDBID)) {
            console.log("Remove");
            // Remove
            contents = list.contents.filter(c => c.tmdb_ID !== movie.fullTMDBID);
        }
        else { // Add
            console.log("Add");
            contents = [...list.contents, fakeContent];
        }

        const partialList: PartialListData = {
            ...list,
            contents: contents
        };

        if (partialList) {
            setLists(prev => {
                const newLists = prev.map(l => l.listName === listName ? partialList : l);
                return sortLists(newLists);
            });
            
            findAndMoveTMDBItemToList(movie, listName, lists); // Fire and forget :)
        }
    } catch (e: any) {
        console.log("Error fake move TMDB item func: ", e);
    } finally {
        setIsLoading(false);
        setMoveModalVisible(false);
    }
};

export const findAndMoveTMDBItemToList = async (movie: Movie, listName: string, lists: PartialListData[]) => {
    const content: ContentData = await RapidAPIGetByTMDBID(movie.tmdbID, movie.mediaType, movie.verticalPoster, movie.horizontalPoster);
    await moveItemToList(content, listName, lists);
};

export const moveItemToList = async (content: ContentData, listName: string, lists: PartialListData[]) => {
    // console.log("Moving!");
    // Only works for user owned lists for now
    let partialList: PartialListData = lists.find(l => l.listName === listName);
    if (!partialList) {
        return;
    }
    const user: User | null = auth.currentUser;
    if (!user) {
        return;
    }
    const token = await user.getIdToken();
    const list: ListData = partialList.contents.some(c => c.contentID === content.contentID) ? 
            await removeContentFromUserList(token, partialList.listName, content.contentID)
            :
            await addContentToUserList(token, partialList.listName, content);
    if (list) {
        const userData: UserData = useUserDataStore.getState().userData;
        userData.listsOwned = userData.listsOwned.filter(l => l.listName !== list.listName);
        userData.listsOwned.push(list);
        setUserData(userData, true);
        console.log("LISTS UPDATED\n");
    }
};

export const moveItemToListWithFuncs = async (content: ContentData, listName: string, lists: ListData[], 
                                setLists: React.Dispatch<React.SetStateAction<ListData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible: React.Dispatch<React.SetStateAction<boolean>>        
) => {
    // Only works for user owned lists for now

    try {
        setIsLoading(true);
        let list: ListData = lists.find(l => l.listName === listName);
        if (!list) {
            return;
        }
        const user: User | null = auth.currentUser;
        if (!user) {
            return;
        }
        const token = await user.getIdToken();
        list = list.contents.some(c => c.contentID === content.contentID) ? 
                await removeContentFromUserList(token, list.listName, content.contentID)
                :
                await addContentToUserList(token, list.listName, content);
        if (list) {
            const userData: UserData = useUserDataStore.getState().userData;
            userData.listsOwned = userData.listsOwned.filter(l => l.listName !== list.listName);
            userData.listsOwned.push(list);
            setLists(sortLists([...userData.listsOwned, ...userData.listsSharedWithMe]));
            setUserData(userData, true);
        }
    } catch (e: any) {
        console.log("Error move item func: ", e);
    } finally {
        setIsLoading(false);
        setMoveModalVisible(false);
    }
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

export default {};
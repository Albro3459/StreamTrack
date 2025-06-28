import { ContentPartialData, ListMinimalData, UserData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "@/app/stores/userDataStore";
import { CACHE, FetchCache } from "../cacheHelper";

export const FAVORITE_TAB = "Favorites";

// Sorts the lists so the favorite tab is first and alphabetical order
export const sortLists = <T extends { listName: string }>(lists: T[]): T[] => {
    return [...lists].sort((a, b) => {
        if (a.listName === FAVORITE_TAB) return -1;
        if (b.listName === FAVORITE_TAB) return 1;
        return a.listName.localeCompare(b.listName);
    });
};

export const getContentsInList = (contents: ContentPartialData[], lists: ListMinimalData[], listName: string): ContentPartialData[] => {
    const list: ListMinimalData = lists.find(l => l.listName === listName);
    return (list && contents) 
                ? contents.filter(c => list.tmdbIDs.includes(c.tmdbID)) 
                : [];
};

export const isItemInListMinimal = (lists: ListMinimalData[], listName: string, tmdbID: string) => {
    const list: ListMinimalData = lists.find(l => l.listName === listName);
    if (!list) return false;

    return list.tmdbIDs.includes(tmdbID);
};

export const isItemInAnyList = (lists: ListMinimalData[], tmdbID: string) => {
    return lists.flatMap(l => l.tmdbIDs).includes(tmdbID);
};

// export const delayedMoveTMDBItemToList = async (movie: Movie, listName: string, lists: ListMinimalData[], 
//                                 setLists: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
//                                 setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
//                                 setMoveModalVisible: React.Dispatch<React.SetStateAction<boolean>>        
// ) => {
//     // Responds with the updated list immediately, but it updates the lists behind the scenes! (Possible race conditions but it makes for a faster UI)
//         // The commit before this possible race condition is 620e70d81d65cf458de2f1fc757b31544dd969f7

//     // Only works for user owned lists for now

//     try {
//         setIsLoading(true);
//         let list: ListMinimalData = lists.find(l => l.listName === listName);
//         if (!list) {
//             return;
//         }
//         const user: User | null = auth.currentUser;
//         if (!user) {
//             return;
//         }
        
//         let tmdbIDs: string[] = [];
//         if (list.tmdbIDs.includes(movie.tmdbID)) {
//             // Remove
//             tmdbIDs = list.tmdbIDs.filter(t => t !== movie.tmdbID);
//         }
//         else { // Add
//             tmdbIDs = [...list.tmdbIDs, movie.tmdbID];
//         }

//         const updatedList: ListMinimalData = {
//             ...list,
//             tmdbIDs: tmdbIDs
//         };

//         if (updatedList) {
//             setLists(prev => {
//                 const newLists = prev.map(l => l.listName === listName ? updatedList : l);
//                 return sortLists(newLists);
//             });
//             const userData: UserData = useUserDataStore.getState().userData;
//             userData.user.listsOwned = userData.user.listsOwned.map(l => l.listName === list.listName ? list : l);
//             if (!userData.contents.some(c => c.tmdbID === movie.tmdbID)) {
//                 userData.contents.push({tmdbID: movie.tmdbID, title: movie.title, releaseYear: movie.releaseYear, verticalPoster: movie.verticalPoster, horizontalPoster: movie.horizontalPoster} as ContentPartialData);

//             }
//             setUserData(userData, true);
            
//             findAndMoveTMDBItemToList(movie, listName, lists); // Fire and forget :)
//         }
//     } catch (e: any) {
//         console.log("Error fake move TMDB item func: ", e);
//     } finally {
//         setIsLoading(false);
//         setMoveModalVisible(false);
//     }
// };

// export const findAndMoveTMDBItemToList = async (movie: Movie, listName: string, lists: ListMinimalData[]) => {
//     const content: ContentData = await RapidAPIGetByTMDBID(movie.tmdbID, movie.verticalPoster, movie.horizontalPoster);
//     await moveItemToList(content, listName, lists);
// };

// export const moveItemToList = async (content: ContentData, listName: string, lists: ListMinimalData[]) => {
//     // Only works for user owned lists for now
//     let list: ListMinimalData = lists.find(l => l.listName === listName);
//     if (!list) {
//         return;
//     }
//     const user: User | null = auth.currentUser;
//     if (!user) {
//         return;
//     }
//     const token = await user.getIdToken();

//     const shouldRemove: boolean = list.tmdbIDs.includes(content.tmdbID);
//     list = shouldRemove 
//             ? await removeContentFromUserList(token, list.listName, content.tmdbID)
//             : await addContentToUserList(token, list.listName, content);
//     if (list) {
//         const userData: UserData = { ...useUserDataStore.getState().userData };
//         userData.user.listsOwned = userData.user.listsOwned.map(l => l.listName === list.listName ? list : l);

//         const isInOtherList = lists.some(l => l.listName !== listName && l.tmdbIDs.includes(content.tmdbID));
//         let contents = [...userData.contents];
//         if (shouldRemove && !isInOtherList) {
//             contents = contents.filter(c => c.tmdbID !== content.tmdbID);
//         } else if (!contents.some(c => c.tmdbID === content.tmdbID)) {
//             contents.push({ tmdbID: content.tmdbID, title: content.title, releaseYear: content.releaseYear, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster } as ContentPartialData);
//         }
//         setUserData({...userData, contents} as UserData, true);
//     }
// };

export const moveItemToListWithFuncs = async (content: ContentPartialData, listName: string, lists: ListMinimalData[], 
                                setLists: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible: React.Dispatch<React.SetStateAction<boolean>>        
) => {
    // Only works for user owned lists for now

    try {
        setIsLoading(true);
        let list: ListMinimalData = lists.find(l => l.listName === listName);
        if (!list) {
            return;
        }
        const user: User | null = auth.currentUser;
        if (!user) {
            return;
        }
        const token = await user.getIdToken();

        const shouldRemove: boolean = list.tmdbIDs.includes(content.tmdbID);
        list = shouldRemove 
                ? await removeContentFromUserList(token, list.listName, content.tmdbID)
                : await addContentToUserList(token, list.listName, content);
        if (list) {
            const userData: UserData = { ...useUserDataStore.getState().userData };
            userData.user.listsOwned = userData.user.listsOwned.map(l => l.listName === list.listName ? list : l);
            setLists(sortLists([...userData.user.listsOwned, ...userData.user.listsSharedWithMe]));

            const isInOtherList = lists.some(l => l.listName !== listName && l.tmdbIDs.includes(content.tmdbID));
            let contents = [...userData.contents];
            if (shouldRemove && !isInOtherList) {
                contents = contents.filter(c => c.tmdbID !== content.tmdbID);
            } else if (!contents.some(c => c.tmdbID === content.tmdbID)) {
                contents.push({ tmdbID: content.tmdbID, title: content.title, releaseYear: content.releaseYear, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster } as ContentPartialData);
            }
            setUserData({...userData, contents} as UserData, true);
        }
    } catch (e: any) {
        console.log("Error move item func: ", e);
    } finally {
        setIsLoading(false);
        setMoveModalVisible(false);
    }
};

export const addContentToUserList = async (token: string | null, listName: string, content: ContentPartialData): Promise<ListMinimalData | null> => {
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

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Adding content to list failed:', err);
        return null;
    }
};

export const removeContentFromUserList = async (token: string | null, listName: string, tmdbID: string): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${listName}/Remove/${tmdbID}`;

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

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Removing content from list failed:', err);
        return null;
    }
};

export const createNewUserList = async (token: string | null, listName: string): Promise<ListMinimalData | null> => {
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

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.error('Creating new list failed:', err);
        return null;
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
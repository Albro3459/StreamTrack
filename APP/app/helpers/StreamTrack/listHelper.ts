"use client";

import { ContentPartialData, ListMinimalData, UserData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "@/app/stores/userDataStore";

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

export const isItemInList = (lists: ListMinimalData[], listName: string, tmdbID: string) => {
    const list: ListMinimalData = lists.find(l => l.listName === listName);
    if (!list) return false;

    return list.tmdbIDs.includes(tmdbID);
};

export const isItemInAnyList = (lists: ListMinimalData[], tmdbID: string) => {
    return lists.flatMap(l => l.tmdbIDs).includes(tmdbID);
};

export const moveItemToList = async (content: ContentPartialData, listName: string, lists: ListMinimalData[], 
                                setLists: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible: React.Dispatch<React.SetStateAction<boolean>>,      
                                setAutoPlay?: React.Dispatch<React.SetStateAction<boolean>>      
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
        if (setAutoPlay) setAutoPlay(true);
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

export default {};
"use client";

import { ContentPartialData, ListMinimalData, UserData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "@/app/stores/userDataStore";
import { Alert } from "@/app/components/alertMessageComponent";

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

export const handleCreateNewTab = async (
                listName: string, 
                lists: ListMinimalData[],
                setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                setListNameFunc: React.Dispatch<React.SetStateAction<string>>,
                setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>,
                setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>,
                setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
               
                moveItemFunc?: (selectedContent: ContentPartialData, listName: string, lists: ListMinimalData[], 
                    setListsFunc:  React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>
                ) => Promise<void>,
                selectedContent?: ContentPartialData,
                setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>,

                setRefsFunc?: (index: number) => void,
                setActiveTabFunc?: React.Dispatch<React.SetStateAction<string>>,
) => {
    let finalLists: ListMinimalData[] = [...lists];
    listName = listName.trim();
    if (listName) {
        try {
            if (!lists.map(l => l.listName.toLowerCase()).includes(listName.toLowerCase())) {
                const user: User | null = auth.currentUser;
                if (!user) {
                    setAlertMessageFunc("User doesn't exist");
                    setAlertTypeFunc(Alert.Error);
                    return;
                }
                const token = await user.getIdToken();
                const newList: ListMinimalData = await createNewUserList(token, listName);
                setListNameFunc("");
                finalLists = sortLists([...lists, newList]);
                setListsFunc(finalLists);

                const userData = useUserDataStore.getState().userData;
                setUserData({
                    ...userData,
                    user: {
                        ...userData.user,
                        listsOwned: [...userData.user.listsOwned, newList],
                    }
                });
            
                if (setActiveTabFunc) setActiveTabFunc(listName);
                if (moveItemFunc) await moveItemFunc(selectedContent, listName, finalLists, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc);
            } else {
                console.warn(`List "${listName}" already exists`);
                setAlertMessageFunc(`List "${listName}" already exists`);
                setAlertTypeFunc(Alert.Error);
            }
        } finally {
            setIsLoadingFunc(false);
            setVisibilityFunc(false);
            if (setRefsFunc) {
                const index = finalLists.findIndex(l => l.listName === listName);
                // console.log("handle: " + index);
                setRefsFunc(index);
            }
        }
    }
};

export const moveItemToList = async (content: ContentPartialData, listName: string, lists: ListMinimalData[], 
                                setLists: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible?: React.Dispatch<React.SetStateAction<boolean>>,      
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
        const updatedList: ListMinimalData = shouldRemove 
                ? await removeContentFromUserList(token, list.listName, content.tmdbID)
                : await addContentToUserList(token, list.listName, content);
        if (updatedList) {
            const userData: UserData = { ...useUserDataStore.getState().userData };
            const newListsOwned: ListMinimalData[] = userData.user.listsOwned.map(l => l.listName === updatedList.listName ? updatedList : l);
            setLists(sortLists([...newListsOwned, ...userData.user.listsSharedWithMe]));

            const isInOtherList = lists.some(l => l.listName !== listName && l.tmdbIDs.includes(content.tmdbID));
            let newContents = [...userData.contents];
            if (shouldRemove && !isInOtherList) {
                newContents = newContents.filter(c => c.tmdbID !== content.tmdbID);
            } else if (!newContents.some(c => c.tmdbID === content.tmdbID)) {
                newContents.push({ tmdbID: content.tmdbID, title: content.title, releaseYear: content.releaseYear, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster } as ContentPartialData);
            }
            setUserData({
                ...userData,
                user: {
                    ...userData.user,
                    listsOwned: newListsOwned
                },
                contents: newContents
            } as UserData, true);
        }
    } catch (e: any) {
        console.log("Error move item func: ", e);
    } finally {
        setIsLoading(false);
        if (setMoveModalVisible) setMoveModalVisible(false);
        if (setAutoPlay) setAutoPlay(true);
    }
};

export const addContentToUserList = async (token: string | null, listName: string, content: ContentPartialData): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName)}/Add`;
        
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
            console.warn(`Error adding content to list ${result.status}: ${text}`);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Adding content to list failed:', err);
        return null;
    }
};

export const removeContentFromUserList = async (token: string | null, listName: string, tmdbID: string): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName)}/Remove/${encodeURIComponent(tmdbID)}`;

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
            console.warn(`Error removing content from list ${result.status}: ${text}`);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Removing content from list failed:', err);
        return null;
    }
};

export const createNewUserList = async (token: string | null, listName: string): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName)}/Create`;
                
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
            console.warn(`Error creating new list ${result.status}: ${text}`);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Creating new list failed:', err);
        return null;
    }
};

export default {};
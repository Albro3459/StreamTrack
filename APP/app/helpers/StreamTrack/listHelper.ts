"use client";

import { ContentPartialData, ListMinimalData, UserData } from "@/app/types/dataTypes";
import { DataAPIURL } from "@/secrets/DataAPIUrl";
import { auth, signOut, User } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "@/app/stores/userDataStore";
import { Alert } from "@/app/components/alertMessageComponent";
import { Router } from "expo-router";

export const FAVORITE_TAB = "Favorites";

export const MAX_USER_LIST_COUNT = 10;

// Sorts the lists so the favorite tab is first and alphabetical order
export const sortLists = <T extends { listName: string }>(lists: T[]): T[] => {
    return [...lists].sort((a, b) => {
        if (a.listName.toLowerCase() === FAVORITE_TAB.toLowerCase()) return -1;
        if (b.listName.toLowerCase() === FAVORITE_TAB.toLowerCase()) return 1;
        return a.listName.toLowerCase().localeCompare(b.listName.toLowerCase());
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

// export const isItemInAnyList = (lists: ListMinimalData[], tmdbID: string) => {
//     return lists.flatMap(l => l.tmdbIDs).includes(tmdbID);
// };

export const handleCreateNewTab = async (
                router: Router,
                listName: string, 
                lists: ListMinimalData[],
                setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                setListNameFunc: React.Dispatch<React.SetStateAction<string>>,
                setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>,
                setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>,
                setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
               
                moveItemFunc?: (router: Router, selectedContent: ContentPartialData, listName: string, lists: ListMinimalData[], 
                    setListsFunc:  React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>
                ) => Promise<void>,
                selectedContent?: ContentPartialData,
                setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>,

                setRefsFunc?: (index: number, length: number) => void,
                setActiveTabFunc?: React.Dispatch<React.SetStateAction<string>>,
) => {
    if (lists.length >= MAX_USER_LIST_COUNT) {
        console.warn(`User reached Max User List Count: ` + MAX_USER_LIST_COUNT);
        setAlertMessageFunc(`You have reached the max amount of lists: ${MAX_USER_LIST_COUNT}`);
        setAlertTypeFunc(Alert.Error);
        setIsLoadingFunc(false);
        setVisibilityFunc(false);
        return;
    } else {
        let finalLists: ListMinimalData[] = [...lists];
        listName = listName?.trim();
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
                    const newList: ListMinimalData = await createNewUserList(router, token, listName, setAlertMessageFunc, setAlertTypeFunc);
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
                    if (moveItemFunc) await moveItemFunc(router, selectedContent, listName, finalLists, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc, );
                } else {
                    console.warn(`List "${listName}" already exists`);
                    setAlertMessageFunc(`List "${listName}" already exists`);
                    setAlertTypeFunc(Alert.Error);
                }
            } finally {
                setIsLoadingFunc(false);
                setVisibilityFunc(false);
                if (setRefsFunc) {
                    const index = finalLists.findIndex(l => l.listName.toLowerCase() === listName.toLowerCase());
                    setRefsFunc(index, finalLists.length);
                }
            }
        }
    }
};

export const moveItemToList = async (router: Router, content: ContentPartialData, listName: string, lists: ListMinimalData[], 
                                setLists: React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                                setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setMoveModalVisible?: React.Dispatch<React.SetStateAction<boolean>>,      
                                setAutoPlay?: React.Dispatch<React.SetStateAction<boolean>>,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>      
) => {
    // Only works for user owned lists for now
    try {
        setIsLoading(true);
        listName = listName.trim();
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
                ? await removeContentFromUserList(router, token, list.listName, content.tmdbID, setAlertMessageFunc, setAlertTypeFunc)
                : await addContentToUserList(router, token, list.listName, content, setAlertMessageFunc, setAlertTypeFunc);
        if (updatedList) {
            const userData: UserData = { ...useUserDataStore.getState().userData };
            const newListsOwned: ListMinimalData[] = userData.user.listsOwned.map(l => l.listName === updatedList.listName ? updatedList : l);
            setLists(sortLists([...newListsOwned, ...userData.user.listsSharedWithMe]));

            const isInOtherList = lists.some(l => l.listName !== listName && l.tmdbIDs.includes(content.tmdbID));
            let newContents = [...userData.contents];
            if (shouldRemove && !isInOtherList) {
                newContents = newContents.filter(c => c.tmdbID !== content.tmdbID);
            } else if (!newContents.some(c => c.tmdbID === content.tmdbID)) {
                newContents.push({ tmdbID: content.tmdbID, title: content.title, releaseYear: content.releaseYear, verticalPoster: content.verticalPoster, largeVerticalPoster: content.largeVerticalPoster, horizontalPoster: content.horizontalPoster } as ContentPartialData);
            }
            setUserData({
                ...userData,
                user: {
                    ...userData.user,
                    listsOwned: newListsOwned
                },
                contents: newContents
            } as UserData, true);
        } else {
            if (setAlertMessageFunc) setAlertMessageFunc(prev => {
                if (prev.includes("limit")) {
                    return prev;
                }
                else return 'Moving item to list failed';
            }); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        }
    } catch (e: any) {
        console.warn("Error move item func: ", e);
        if (setAlertMessageFunc) setAlertMessageFunc('Error moving item to list'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    } finally {
        setIsLoading(false);
        if (setMoveModalVisible) setMoveModalVisible(false);
        if (setAutoPlay) setAutoPlay(true);
    }
};

export const addContentToUserList = async (router: Router, token: string | null, listName: string, content: ContentPartialData,
                                            setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                            setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName.trim())}/Add`;
                
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                router.replace({
                    pathname: '/LoginPage',
                    params: { unauthorized: 1 },
                });
                return null;
            }
            let text = await result.text();
            console.warn(`Error adding content to list ${result.status}: ${text}`);
            if (setAlertMessageFunc) {
                if (text.startsWith('"') && text.endsWith('"')) {
                    text = text.slice(1, -1);
                }
                setAlertMessageFunc(text);
            }
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Adding content to list failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Adding content to list failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const removeContentFromUserList = async (router: Router, token: string | null, listName: string, tmdbID: string,
                                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName.trim())}/Remove/${encodeURIComponent(tmdbID.trim())}`;

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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                router.replace({
                    pathname: '/LoginPage',
                    params: { unauthorized: 1 },
                });
                return null;
            }
            const text = await result.text();
            console.warn(`Error removing content from list ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error removing content from list'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Removing content from list failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Removing content from list failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const createNewUserList = async (router: Router, token: string | null, listName: string, 
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
                                    ) : Promise<ListMinimalData | null> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName.trim())}/Create`;
                
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                router.replace({
                    pathname: '/LoginPage',
                    params: { unauthorized: 1 },
                });
                return null;
            }
            const text = await result.text();
            console.warn(`Error creating new list ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error creating new list'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }

        const data: ListMinimalData = await result.json();
        
        return data;

    } catch (err) {
        console.warn('Creating new list failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Creating new list failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return null;
    }
};

export const deleteUserList = async (router: Router, token: string | null, listName: string, 
                                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
                                    ) : Promise<boolean> => {
    try {
        if (!token) return null;

        const url = DataAPIURL + `API/List/${encodeURIComponent(listName.trim())}/Remove`;
                
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
            if (result.status === 401) {
                console.warn("Unauthorized");
                await signOut(auth);
                router.replace({
                    pathname: '/LoginPage',
                    params: { unauthorized: 1 },
                });
                return false;
            }
            const text = await result.text();
            console.warn(`Error deleting list ${result.status}: ${text}`);
            if (setAlertMessageFunc) setAlertMessageFunc('Error deleting list'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return false;
        }

        return true;

    } catch (err) {
        console.warn('Deleting list failed:', err);
        if (setAlertMessageFunc) setAlertMessageFunc('Deleting list failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export default {};
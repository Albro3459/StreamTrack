"use client";

import { appStyles } from "@/styles/appStyles";
import { Modal, Pressable, View, Text } from "react-native";
import Heart from "./heartComponent";
import { createNewUserList, FAVORITE_TAB, sortLists } from "../helpers/StreamTrack/listHelper";
import { Colors } from "@/constants/Colors";
import { ContentPartialData, ListMinimalData } from "../types/dataTypes";
import { useState } from "react";
import { auth } from "@/firebaseConfig";
import { setUserData, useUserDataStore } from "../stores/userDataStore";
import { User } from "firebase/auth";
import CreateNewListModal from "./createNewListComponent";
import { Alert } from "./alertMessageComponent";

interface MoveModalProps {
    selectedContent: ContentPartialData;
    lists: ListMinimalData[];

    showLabel?: boolean;
    showHeart?: boolean;
    visibility: boolean;

    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>;
    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>;
    
    moveItemFunc: (selectedItem: any, listName: string, lists: ListMinimalData[], 
                    setListsFunc:  React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void>;
    isItemInListFunc: (lists: ListMinimalData[], listName: string, tmdbID: string) => boolean;

    setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>;

    setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>;
    setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>;
}

export default function MoveModal({ 
    selectedContent,
    lists, 
    showLabel = true, 
    showHeart = true, 
    visibility, 
    setVisibilityFunc, 
    setIsLoadingFunc, 
    setAutoPlayFunc, 
    moveItemFunc, 
    isItemInListFunc, 
    setListsFunc,
    setAlertMessageFunc,
    setAlertTypeFunc
} : MoveModalProps) {

    const {userData} = useUserDataStore();

    const [createListModalVisible, setCreateListModalVisible] = useState<boolean>(false);
    const [newListName, setNewListName] = useState<string>("");

    const handelCreateNewTab = async (listName: string, lists: ListMinimalData[], 
                        setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>,
                        setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        try {
            listName = listName.trim();
            if (listName && !lists.map(l => l.listName.toLowerCase()).includes(listName.toLowerCase())) {
                setIsLoadingFunc(true);
                const user: User | null = auth.currentUser;
                if (!user) {
                    setAlertMessageFunc("User doesn't exist");
                    setAlertTypeFunc(Alert.Error);
                    return;
                }
                const token = await user.getIdToken();
                const newList: ListMinimalData = await createNewUserList(token, listName);
                setListsFunc(prev => sortLists([...prev, newList]));
                userData.user.listsOwned.push(newList);
                setUserData(userData);
    
                await moveItemFunc(selectedContent, listName, userData.user.listsOwned, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc); // Fire and Forget
                // setVisibilityFunc(false);
                setNewListName("");
            }
            else {
                console.warn(`List "${listName}" already exists`);
                setAlertMessageFunc(`List "${listName}" already exists`);
                setAlertTypeFunc(Alert.Error);
            }
        } finally {
            setIsLoadingFunc(false);
            setCreateListModalVisible(false);
        }
    };

    if (!selectedContent) return null;

    return (
        <>
        <Modal
            transparent={true}
            visible={visibility}
            animationType="fade"
            onRequestClose={() => { setVisibilityFunc(false); setAutoPlayFunc && setAutoPlayFunc(true); }}
        >
            <Pressable
                style={appStyles.modalOverlay}
                onPress={() =>  { setVisibilityFunc(false); setAutoPlayFunc && setAutoPlayFunc(true); }}
            >
                <View style={[appStyles.modalContent, showHeart && {paddingBottom: 10}]}>
                    {showLabel && <Text style={appStyles.modalTitle}>
                        Save to...
                    </Text>}
                    <>
                        {/* Render all tabs except FAVORITE_TAB */}
                        {sortLists(lists)
                            .filter((list) => list.listName !== FAVORITE_TAB)
                            .map((list, index) => {
                                const isSelected = isItemInListFunc(lists, list.listName, selectedContent.tmdbID);
                                return (<Pressable
                                    key={`LandingPage-${selectedContent.tmdbID}-${list.listName}-${index}`}
                                    style={[
                                        appStyles.modalButton,
                                        isSelected && appStyles.selectedModalButton,
                                    ]}
                                    onPress={async () => await moveItemFunc(selectedContent, list.listName, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc)}
                                >
                                    <Text style={[
                                        appStyles.modalButtonText,
                                        isSelected && appStyles.selectedModalButtonText,
                                    ]}>
                                        {list.listName} {isSelected ? "✓" : ""}
                                    </Text>
                                </Pressable>)}
                        )}

                        {/* Create new list and add item button */}
                        <Pressable
                            key={`LandingPage-${selectedContent.tmdbID}-CreateNewList`}
                            style={[
                                appStyles.modalButton, {backgroundColor: Colors.goldColor}
                            ]}
                            onPress={() => {setVisibilityFunc(false); setCreateListModalVisible(true);}}
                        >
                            <Text style={[
                                appStyles.modalButtonText, {color: Colors.altBackgroundColor}
                            ]}>
                                Create New List & Add
                            </Text>
                        </Pressable>

                        {/* Render FAVORITE_TAB at the bottom */}
                        {showHeart && lists.find(l => l.listName === FAVORITE_TAB) && (
                            <View
                                key={`LandingPage-${selectedContent.tmdbID}-heart`}
                                style={{ paddingTop: 10 }}
                            >
                            <Heart
                                heartColor={
                                    isItemInListFunc(lists, FAVORITE_TAB, selectedContent.tmdbID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor
                                }
                                size={35}
                                onPress={async () => await moveItemFunc(selectedContent, FAVORITE_TAB, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc)}
                            />
                            </View>
                        )}
                    </>
                </View>
            </Pressable>
        </Modal>
        
        <CreateNewListModal
            visible={createListModalVisible}
            listName={newListName}
            lists={lists}
            setListNameFunc={setNewListName}
            onCreateFunc={handelCreateNewTab}
            onRequestCloseFunc={() => setCreateListModalVisible(false)}
            setAlertMessageFunc={setAlertMessageFunc}
            setAlertTypeFunc={setAlertTypeFunc}
        />
        </>
    );
};
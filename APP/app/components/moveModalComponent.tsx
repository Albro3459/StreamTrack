"use client";

import { appStyles } from "@/styles/appStyles";
import { Modal, Pressable, View, Text } from "react-native";
import Heart from "./heartComponent";
import { FAVORITE_TAB, handleCreateNewTab, sortLists } from "../helpers/StreamTrack/listHelper";
import { Colors } from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { ContentPartialData, ListMinimalData } from "../types/dataTypes";
import { useState } from "react";
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
                    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>,
                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>   
    ) => Promise<void>;
    isItemInListFunc: (lists: ListMinimalData[], listName: string, tmdbID: string) => boolean;

    setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>;

    setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>;
    setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>;

    // Used fo create new list modal
    setRefsFunc?: (index: number, length: number) => void,
    setActiveTabFunc?: React.Dispatch<React.SetStateAction<string>>,
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
    setAlertTypeFunc,
    setRefsFunc,
    setActiveTabFunc,
} : MoveModalProps) {

    const [createListModalVisible, setCreateListModalVisible] = useState<boolean>(false);
    const [newListName, setNewListName] = useState<string>("");

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
                style={[appStyles.modalOverlay]}
                onPress={() =>  { setVisibilityFunc(false); setAutoPlayFunc && setAutoPlayFunc(true); }}
            >
                <View style={[appStyles.modalContent, showHeart && {paddingBottom: 10}]}>
                    <View style={{ position: "relative", alignItems: "center", width: "100%", minHeight: 30 }}>
                        {showLabel && (
                            <Text style={appStyles.modalTitle}>
                                Add to List
                            </Text>
                        )}
                        <Pressable
                            onPress={() => {setVisibilityFunc(false); setCreateListModalVisible(true);}}
                            style={{ position: "absolute", right: 0, top: -5 }}
                        >
                            <Ionicons name="add" size={28} color="white" />
                        </Pressable>
                    </View>
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
                                    onPress={async () => await moveItemFunc(selectedContent, list.listName, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc, setAutoPlayFunc, setAlertMessageFunc, setAlertTypeFunc)}
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
                        {/* <Pressable
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
                        </Pressable> */}

                        {/* Render FAVORITE_TAB at the bottom */}
                        {showHeart && lists.find(l => l.listName === FAVORITE_TAB) && (
                            <View
                                key={`LandingPage-${selectedContent.tmdbID}-heart`}
                                style={{ paddingTop: 10 }}
                            >
                            <Heart
                                isSelected={() => isItemInListFunc(lists, FAVORITE_TAB, selectedContent.tmdbID)}
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
            setVisibilityFunc={setCreateListModalVisible}
            setIsLoadingFunc={setIsLoadingFunc}

            title={"Create & Add to New List"}

            listName={newListName}
            setListNameFunc={setNewListName}
            lists={lists}
            setListsFunc={setListsFunc}

            onCreateNewTabFunc={handleCreateNewTab}
            moveItemFunc={moveItemFunc}
            selectedContent={selectedContent}
            setAutoPlayFunc={setAutoPlayFunc}
            setRefsFunc={setRefsFunc}
            setActiveTabFunc={setActiveTabFunc}

            onRequestCloseFunc={() => setCreateListModalVisible(false)}

            setAlertMessageFunc={setAlertMessageFunc}
            setAlertTypeFunc={setAlertTypeFunc}
        />
        </>
    );
};
import { appStyles } from "@/styles/appStyles";
import { Modal, Pressable, TouchableOpacity, View, Text } from "react-native";
import Heart from "./heartComponent";
import { FAVORITE_TAB, sortLists } from "../helpers/StreamTrack/listHelper";
import { Colors } from "@/constants/Colors";
import { ListData, ListMinimalData } from "../types/dataTypes";

export enum MOVE_MODAL_DATA_ENUM {
    TMDB,
    CONTENT_DATA
};

interface MoveModalProps {
    selectedItem: any;
    lists: ListMinimalData[];

    showLabel?: boolean;
    showHeart?: boolean;
    visibility: boolean;

    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>;
    
    moveItemFunc: (selectedItem: any, listName: string, lists: ListMinimalData[], 
                    setListsFunc:  React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
                    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void>;
    isItemInListFunc: (lists: ListMinimalData[], listName: string, itemID: string) => boolean;

    setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>;
}

export const MoveModal: React.FC<MoveModalProps> = ({ selectedItem, lists, showLabel = true, showHeart = true, visibility, setVisibilityFunc, setIsLoadingFunc, moveItemFunc, isItemInListFunc, setListsFunc}) => {

    if (!selectedItem) return null;

    return (
        <Modal
            transparent={true}
            visible={visibility}
            animationType="fade"
            onRequestClose={() => setVisibilityFunc(false)}
        >
            <Pressable
                style={appStyles.modalOverlay}
                onPress={() => setVisibilityFunc(false)}
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
                                const isSelected = isItemInListFunc(lists, list.listName, selectedItem.tmdbID);
                                return (<Pressable
                                    key={`LandingPage-${selectedItem.tmdbID}-${list.listName}-${index}`}
                                    style={[
                                        appStyles.modalButton,
                                        isSelected && appStyles.selectedModalButton,
                                    ]}
                                    onPress={async () => await moveItemFunc(selectedItem, list.listName, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc)}
                                >
                                    <Text style={[
                                        appStyles.modalButtonText,
                                        isSelected && appStyles.selectedModalButtonText,
                                    ]}>
                                        {list.listName} {isSelected ? "✓" : ""}
                                    </Text>
                                </Pressable>)}
                        )}

                        {/* Render FAVORITE_TAB at the bottom */}
                        {showHeart && lists.find(l => l.listName === FAVORITE_TAB) && (
                            <View
                                key={`LandingPage-${selectedItem.tmdbID}-heart`}
                                style={{ paddingTop: 10 }}
                            >
                            <Heart
                                heartColor={
                                    isItemInListFunc(lists, FAVORITE_TAB, selectedItem.tmdbID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor
                                }
                                size={35}
                                onPress={async () => await moveItemFunc(selectedItem, FAVORITE_TAB, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc)}
                            />
                            </View>
                        )}
                    </>
                </View>
            </Pressable>
        </Modal>
    );
};

export default {};
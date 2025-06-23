import { appStyles } from "@/styles/appStyles";
import { Modal, Pressable, TouchableOpacity, View, Text } from "react-native";
import Heart from "./heartComponent";
import { FAVORITE_TAB } from "../helpers/StreamTrack/listHelper";
import { Colors } from "@/constants/Colors";
import { ListData } from "../types/dataTypes";

export enum MOVE_MODAL_DATA_ENUM {
    TMDB,
    CONTENT_DATA
};

interface MoveModalProps {
    dataType: MOVE_MODAL_DATA_ENUM;
    selectedItem: any;
    lists: any[];

    showHeart?: boolean;
    visibility: boolean;

    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>;
    
    moveItemFunc: (selectedItem: any, listName: string, lists: any[], 
                    setListsFunc:  React.Dispatch<React.SetStateAction<any[]>>,
                    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
                    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void>;
    isItemInListFunc: (lists: any[], listName: string, itemID: string) => boolean;

    setListsFunc: React.Dispatch<React.SetStateAction<ListData[]>>;
}

export const MoveModal: React.FC<MoveModalProps> = ({ dataType, selectedItem, lists, showHeart = true, visibility, setVisibilityFunc, setIsLoadingFunc, moveItemFunc, isItemInListFunc, setListsFunc}) => {

    if (!selectedItem) return null;

    const id = dataType === MOVE_MODAL_DATA_ENUM.CONTENT_DATA ? selectedItem.contentID : selectedItem.fullTMDBID;

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
                <View style={appStyles.modalContent}>
                    <Text style={appStyles.modalTitle}>
                        Save to...
                    </Text>
                    <>
                        {/* Render all tabs except FAVORITE_TAB */}
                        {lists
                            .filter((list) => list.listName !== FAVORITE_TAB)
                            .map((list, index) => {
                                const isSelected = isItemInListFunc(lists, list.listName, id);
                                return (<Pressable
                                    key={`LandingPage-${id}-${list.listName}-${index}`}
                                    style={[
                                        appStyles.modalButton,
                                        isSelected && appStyles.selectedModalButton,
                                    ]}
                                    onPress={async () => await moveItemFunc(selectedItem, list.listName, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc)}
                                >
                                    <Text style={appStyles.modalButtonText}>
                                        {list.listName} {isSelected ? "✓" : ""}
                                    </Text>
                                </Pressable>)}
                        )}

                        {/* Render FAVORITE_TAB at the bottom */}
                        {showHeart && lists.find(l => l.listName === FAVORITE_TAB) && (
                            <View
                            key={`LandingPage-${id}-heart`}
                            style={{ paddingTop: 10 }}
                            >
                            <Heart
                                heartColor={
                                    isItemInListFunc(lists, FAVORITE_TAB, id) ? Colors.selectedHeartColor : Colors.unselectedHeartColor
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
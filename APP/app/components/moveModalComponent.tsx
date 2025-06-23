import { appStyles } from "@/styles/appStyles";
import { Modal, Pressable, TouchableOpacity, View, Text } from "react-native";
import Heart from "./heartComponent";
import { FAVORITE_TAB } from "../helpers/StreamTrack/listHelper";
import { Colors } from "@/constants/Colors";
import { ListData } from "../types/dataTypes";

interface MoveModalProps {
    selectedItem: any;
    lists: any[];

    showHeart: boolean;
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

export const MoveModal: React.FC<MoveModalProps> = ({ selectedItem, lists, showHeart, visibility, setVisibilityFunc, setIsLoadingFunc, moveItemFunc, isItemInListFunc, setListsFunc}) => {

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
                <View style={appStyles.modalContent}>
                    <Text style={appStyles.modalTitle}>
                        Move "{selectedItem?.title}" to:
                    </Text>
                    <>
                        {/* Render all tabs except FAVORITE_TAB */}
                        {lists
                            .filter((list) => list.listName !== FAVORITE_TAB)
                            .map((list, index) => (
                            <TouchableOpacity
                                key={`LandingPage-${selectedItem.contentID}-${list.listName}-${index}`}
                                style={[
                                    appStyles.modalButton,
                                    isItemInListFunc(lists, list.listName, selectedItem.contentID) && appStyles.selectedModalButton,
                                ]}
                                onPress={async () => await moveItemFunc(selectedItem, list.listName, lists, setListsFunc, setIsLoadingFunc, setVisibilityFunc)}
                            >
                                <Text style={appStyles.modalButtonText}>
                                    {list.listName} {isItemInListFunc(lists, list.listName, selectedItem.contentID) ? "✓" : ""}
                                </Text>
                            </TouchableOpacity>
                            ))}

                        {/* Render FAVORITE_TAB at the bottom */}
                        {showHeart && lists.find(l => l.listName === FAVORITE_TAB) && (
                            <View
                            key={`LandingPage-${selectedItem.contentID}-heart`}
                            style={{ paddingTop: 10 }}
                            >
                            <Heart
                                heartColor={
                                    isItemInListFunc(lists, FAVORITE_TAB, selectedItem.contentID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor
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
"use client";

import { Colors } from "@/constants/Colors";
import { appStyles } from "@/styles/appStyles";
import React, { useEffect } from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { ContentPartialData, ListMinimalData } from "../types/dataTypes";
import { Alert } from "./alertMessageComponent";

interface CreateNewListModalProps {
    visible: boolean;
    setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,

    listName: string;
    setListNameFunc: (listName: string) => void;
    lists: ListMinimalData[];
    setListsFunc: React.Dispatch<React.SetStateAction<ListMinimalData[]>>;

    onCreateNewTabFunc: (
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
    ) => Promise<void>;
    moveItemFunc?: (
        selectedContent: ContentPartialData, listName: string, lists: ListMinimalData[], 
        setListsFunc:  React.Dispatch<React.SetStateAction<ListMinimalData[]>>,
        setIsLoadingFunc: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibilityFunc: React.Dispatch<React.SetStateAction<boolean>>,
        setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void>;
    selectedContent?: ContentPartialData;
    setAutoPlayFunc?: React.Dispatch<React.SetStateAction<boolean>>;
    setRefsFunc?: (index: number) => void,
    setActiveTabFunc?: React.Dispatch<React.SetStateAction<string>>,

    onRequestCloseFunc: () => void;

    setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>;
    setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>;
}

export default function CreateNewListModal({
    visible,
    setVisibilityFunc,
    setIsLoadingFunc,

    listName,
    setListNameFunc,
    lists,
    setListsFunc,

    onCreateNewTabFunc,
    selectedContent,
    setAutoPlayFunc,
    moveItemFunc,
    setRefsFunc,
    setActiveTabFunc,

    onRequestCloseFunc,
    setAlertMessageFunc,
    setAlertTypeFunc
} : CreateNewListModalProps) {
    
    useEffect(() => {
        if (visible) { // Clear text field on load
            setListNameFunc("");
        }
    }, [visible]);

    return (<Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={onRequestCloseFunc}
            >
                <Pressable style={styles.modalOverlay} onPress={onRequestCloseFunc}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New List</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter list name"
                        placeholderTextColor="darkgrey"
                        value={listName}
                        onChangeText={setListNameFunc}
                        onSubmitEditing={async () => await onCreateNewTabFunc(listName, lists, setListsFunc, setListNameFunc, setAlertMessageFunc, setAlertTypeFunc, setIsLoadingFunc, setVisibilityFunc, moveItemFunc, selectedContent, setAutoPlayFunc, setRefsFunc, setActiveTabFunc)}
                        autoFocus
                    />
                    <View style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onRequestCloseFunc}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={async () => await onCreateNewTabFunc(listName, lists, setListsFunc, setListNameFunc, setAlertMessageFunc, setAlertTypeFunc, setIsLoadingFunc, setVisibilityFunc, moveItemFunc, selectedContent, setAutoPlayFunc, setRefsFunc, setActiveTabFunc)}>
                            <Text style={styles.buttonText}>Add</Text>
                        </Pressable>
                    </View>
                </View>
                </Pressable>
            </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 20,
        width: '67%',
        alignItems: 'center',
        ...appStyles.shadow
    },
    modalTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    textInput: {
        width: '100%',
        borderWidth: 1,
        backgroundColor: Colors.grayCell,
        borderColor: Colors.backgroundColor,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        color: Colors.backgroundColor,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        columnGap: 10
    },
    cancelButton: {
        ...appStyles.button,
        ...appStyles.secondaryButton,
        width: undefined,
        flex: 1
    },
    cancelButtonText: {
        ...appStyles.buttonText,
        ...appStyles.secondaryButtonText,
    },
    button: {
        ...appStyles.button,
        width: undefined,
        flex: 1
    },
    buttonText: {
    ...appStyles.buttonText,
    },
});
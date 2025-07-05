"use client";

import { Colors } from "@/constants/Colors";
import { appStyles } from "@/styles/appStyles";
import React from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";

interface CreateNewListModalProps {
    visible: boolean;
    listName: string;
    setListNameFunc: (name: string) => void;
    onCreateFunc: (name: string) => Promise<void>;
    onRequestCloseFunc: () => void;
}

export default function CreateNewListModal({
    visible,
    listName,
    setListNameFunc,
    onCreateFunc,
    onRequestCloseFunc,
} : CreateNewListModalProps) {
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
                        onSubmitEditing={async () => await onCreateFunc(listName)}
                        autoFocus
                    />
                    <View style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onRequestCloseFunc}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={async () => await onCreateFunc(listName)}>
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
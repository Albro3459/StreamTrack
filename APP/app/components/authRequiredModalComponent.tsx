"use client";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/Colors";
import { appStyles } from "../../styles/appStyles";
import { useAuthPromptStore } from "../stores/authPromptStore";

export default function AuthRequiredModal() {
    const router = useRouter();
    const { visible, returnTo, hideAuthPrompt } = useAuthPromptStore();

    const goToAuth = () => {
        hideAuthPrompt();
        router.replace({
            pathname: "/LoginPage",
            params: { returnTo },
        });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={hideAuthPrompt}
        >
            <Pressable style={appStyles.modalOverlay} onPress={hideAuthPrompt}>
                <Pressable style={styles.modalContent} onPress={(event) => event.stopPropagation()}>
                    <Pressable style={styles.closeButton} onPress={hideAuthPrompt}>
                        <Feather name="x" size={22} color={Colors.selectedTextColor} />
                    </Pressable>
                    <Text style={styles.title}>Sign in/up to continue</Text>
                    <Text style={styles.body}>
                        Lists, favorites, and profile preferences are saved to your account. You can keep browsing as a guest.
                    </Text>
                    <Pressable style={styles.primaryButton} onPress={goToAuth}>
                        <Text style={appStyles.buttonText}>Sign In / Sign Up</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={hideAuthPrompt}>
                        <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 20,
        width: "82%",
        maxWidth: 420,
        alignItems: "center",
        ...appStyles.shadow,
    },
    closeButton: {
        position: "absolute",
        right: 12,
        top: 12,
        padding: 6,
        zIndex: 2,
    },
    title: {
        color: Colors.selectedTextColor,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        paddingHorizontal: 24,
        textAlign: "center",
    },
    body: {
        color: Colors.reviewTextColor,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 18,
    },
    primaryButton: {
        ...appStyles.button,
        width: "100%",
        marginBottom: 12,
    },
    secondaryButton: {
        ...appStyles.button,
        ...appStyles.secondaryButton,
        width: "100%",
    },
    secondaryButtonText: {
        ...appStyles.buttonText,
        ...appStyles.secondaryButtonText,
    },
});

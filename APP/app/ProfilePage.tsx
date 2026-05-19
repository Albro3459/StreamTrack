"use client";

import { Text, TextInput, View, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Keyboard, Modal } from "react-native";
import React, { useEffect, useState } from 'react';
import { PressableBubblesGroup,} from './components/formComponents';
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { AddPasswordLogin, DeleteAccount, LogOut } from "./helpers/authHelper";
import { auth } from "../firebaseConfig";
import { appStyles } from "../styles/appStyles";
import { fetchUserData, setUserData, useUserDataStore } from "./stores/userDataStore";
import { UserData, UserMinimalData } from "./types/dataTypes";
import { updateUserProfile } from "./helpers/StreamTrack/userHelper";
import { useStreamingServiceDataStore } from "./stores/streamingServiceDataStore";
import { useGenreDataStore } from "./stores/genreDataStore";
import AlertMessage, { Alert } from "./components/alertMessageComponent";
import { HeaderButton, hiddenGlassHeaderItem } from "./components/headerButtonComponent";

interface ProfilePageParams {
    isSigningUp?: number;
    firstName?: string;
    lastName?: string;
}

export default function ProfilePage() {
    const router = useRouter();

    const { isSigningUp, firstName, lastName } = useLocalSearchParams() as ProfilePageParams;
    const [isEditing, setIsEditing] = useState<boolean>(!isSigningUp ? false : Number(isSigningUp) === 1 ? true : false);
    const [saving, setSaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [addingPassword, setAddingPassword] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [deletePassword, setDeletePassword] = useState<string>("");
    const [providerIds, setProviderIds] = useState<string[]>(
        auth.currentUser?.providerData?.map(provider => provider.providerId) ?? []
    );

    const { userData } = useUserDataStore();
    const { streamingServiceData, loading: streamingServiceLoading, error: streamingServiceError } = useStreamingServiceDataStore();
    const { genreData, loading: genreLoading, error: genreError } = useGenreDataStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    // State for text inputs
    const [firstNameText, setFirstNameText] = useState<string>(firstName ?? userData?.user?.firstName ?? "");
    const [lastNameText, setLastNameText] = useState<string>(lastName ?? userData?.user?.lastName ?? "");
    
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(
        userData?.user?.genreNames ? new Set(userData.user.genreNames) // Objects work weird in sets. Use the strings
            : new Set()
    );

    const [selectedStreamingServices, setSelectedStreamingServices] = useState<Set<string>>(
        userData?.user?.streamingServices ? new Set(userData.user.streamingServices.map(s => s.name)) // Objects work weird in sets. Use the strings
            : new Set()
    );

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        setAlertMessage("");
        setAlertType(Alert.Error);
        try {
            await fetchUserData(router, await auth.currentUser.getIdToken(), setAlertMessage, setAlertType);
        } finally {
            setRefreshing(false);
        }
    };

    const saveProfile = async (firstName: string | null, lastName: string | null, 
                                genres: Set<string>, streamingServices: Set<string>,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        try {
            setSaving(true);
            const user = auth.currentUser;
            const token = user ? await user?.getIdToken() : null;
    
            const userMinimalData: UserMinimalData = await updateUserProfile(router, token, firstName?.trim(), lastName?.trim(), genres, streamingServices, setAlertMessageFunc, setAlertTypeFunc);
            if (userMinimalData) {
                const newUserData: UserData = {
                    user: userMinimalData,
                    contents: userData.contents
                }
                setUserData(newUserData);
            }
            
        } catch(e: any) {
            console.warn("Error saving user profile: ", e);
            if (setAlertMessageFunc) setAlertMessageFunc('Error saving user profile');
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        } finally {
            setIsEditing(false);
            setSaving(false);
    
            if (Number(isSigningUp) === 1) {
                router.replace({
                    pathname: '/LandingPage',
                    params: { justSignedUp: 1 }
                });
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            setAlertMessage("");
            setAlertType(Alert.Error);

            const success = await DeleteAccount(auth, router, deletePassword, setAlertMessage, setAlertType);
            if (!success) {
                return;
            }
            setDeletePassword("");
            setDeleteModalVisible(false);
        } finally {
            setDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteModalVisible(false);
        setDeletePassword("");
    };

    const showPasswordReauth = () => {
        return providerIds.includes("password") && !providerIds.includes("apple.com") && !providerIds.includes("google.com");
    };

    const showAddPasswordLogin = () => {
        return !providerIds.includes("password") && (providerIds.includes("apple.com") || providerIds.includes("google.com"));
    };

    const closePasswordModal = () => {
        setPasswordModalVisible(false);
        setNewPassword("");
        setConfirmNewPassword("");
    };

    const handleAddPasswordLogin = async () => {
        if (newPassword !== confirmNewPassword) {
            setAlertMessage("Passwords do not match");
            setAlertType(Alert.Error);
            return;
        }

        try {
            setAddingPassword(true);
            setAlertMessage("");
            setAlertType(Alert.Error);
            const success = await AddPasswordLogin(auth, newPassword, setAlertMessage, setAlertType);
            if (success) {
                setProviderIds(auth.currentUser?.providerData?.map(provider => provider.providerId) ?? []);
                closePasswordModal();
            }
        } finally {
            setAddingPassword(false);
        }
    };

    const renderOptionsState = (loading: boolean, error: string | null, hasData: boolean) => {
        if (hasData) return null;

        return (
            <Text style={styles.optionsStateText}>
                {loading ? "Loading..." : error ? "Unable to load options" : "No options available"}
            </Text>
        );
    };

    useEffect(() => {
        if (Number(isSigningUp) === 1) {
            setFirstNameText(firstName ?? userData?.user?.firstName ?? "");
            setLastNameText(lastName ?? userData?.user?.lastName ?? "");
            return;
        }

        if (Number(isSigningUp) !== 1 && userData) {
            setFirstNameText(userData.user?.firstName ?? null);
            setLastNameText(userData?.user?.lastName ?? null);
            setSelectedGenres(
                userData?.user?.genreNames ? new Set(userData.user.genreNames)
                    : new Set()
            );
            setSelectedStreamingServices(
                userData?.user?.streamingServices ? new Set(userData.user.streamingServices.map(s => s.name))
                    : new Set()
            );
            setProviderIds(auth.currentUser?.providerData?.map(provider => provider.providerId) ?? []);
            setIsEditing(false);
        }
    }, [firstName, isSigningUp, lastName, userData]);

    const isSigningUpUser = Number(isSigningUp) === 1;
    const backButton = (
        <HeaderButton accessibilityLabel="Back" onPress={() => router.back()}>
            <Feather name="chevron-left" size={32} color={Colors.selectedTextColor} />
        </HeaderButton>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: isSigningUpUser ? () => null : () => backButton,
                    unstable_headerLeftItems: isSigningUpUser ? () => [] : () => [hiddenGlassHeaderItem(backButton)],
                    headerBackVisible: false,
                }}
            />
            <View style={{ flex: 1 }}>
                <AlertMessage
                    type={alertType}
                    message={alertMessage}
                    setMessage={setAlertMessage}
                />
                <ScrollView 
                    style={styles.background}
                    onScroll={Keyboard.dismiss}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.selectedTextColor} // iOS spinner color
                            colors={[Colors.selectedTextColor]} // Android spinner color
                        />
                    }
                >
                    {/* First container */}
                    <View style={[styles.container]}>
                        <View style={[styles.labelContainer, {paddingTop: 10}]}>
                            <Text style={styles.labelText}>First Name</Text>
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholderTextColor={Colors.italicTextColor}
                            value={firstNameText || ""}
                            autoCapitalize="words"
                            onChangeText={(newText) => {setFirstNameText(newText); setIsEditing(true);}}
                        />
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Last Name</Text>
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholderTextColor={Colors.italicTextColor}
                            value={lastNameText || ""}
                            autoCapitalize="words"
                            onChangeText={(newText) => {setLastNameText(newText); setIsEditing(true);}}
                        />

                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Favorite Genres</Text>
                        </View>
                        <View style={styles.pressableContainer}>
                            {renderOptionsState(genreLoading, genreError, !!genreData?.length)}
                            <PressableBubblesGroup
                                labels={genreData?.map(g => g.name)}
                                selectedLabels={selectedGenres}
                                setLabelState={setSelectedGenres}
                                styles={styles}
                                onChange={setIsEditing}
                            />
                        </View>

                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Streaming Services</Text>
                        </View>
                        <View style={styles.pressableContainer}>
                            {renderOptionsState(streamingServiceLoading, streamingServiceError, !!streamingServiceData?.length)}
                            <PressableBubblesGroup
                                selectedLabels={selectedStreamingServices}
                                setLabelState={setSelectedStreamingServices}
                                styles={styles}
                                onChange={setIsEditing}
                                services={streamingServiceData}
                            />
                        </View>
                    </View>

                    {/* <View style={styles.separatorLine}></View> */}

                    {/* Button container */}
                    <View style={styles.buttonContainer} >
                        {/* Button */}
                        { isEditing || Number(isSigningUp) === 1 ? (
                            <Pressable style={appStyles.button} onPress={async () => await saveProfile(firstNameText, lastNameText, selectedGenres, selectedStreamingServices, setAlertMessage, setAlertType)}>
                                <Text style={appStyles.buttonText}>Save</Text>
                            </Pressable>
                        ) : (
                            <>
                                <Pressable style={appStyles.button} onPress={async () => { await LogOut(auth); router.replace('/LoginPage');}}>
                                    <Text style={appStyles.buttonText}>Logout</Text>
                                </Pressable>
                                {showAddPasswordLogin() && (
                                    <Pressable style={[appStyles.button, appStyles.secondaryButton, styles.passwordLoginButton]} onPress={() => setPasswordModalVisible(true)}>
                                        <Text style={[appStyles.buttonText, appStyles.secondaryButtonText]}>Add Password Login</Text>
                                    </Pressable>
                                )}
                                <Pressable style={styles.deleteAccountButton} onPress={() => setDeleteModalVisible(true)}>
                                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                                </Pressable>
                            </>
                        )}
                    </View>

                </ScrollView>

                <Modal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeDeleteModal}
                >
                    <View style={appStyles.modalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <Text style={styles.deleteModalTitle}>Delete Account?</Text>
                            <Text style={styles.deleteModalText}>
                                This will permanently delete your StreamTrack account.
                            </Text>
                            {showPasswordReauth() && (
                                <TextInput
                                    style={styles.deletePasswordInput}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.italicTextColor}
                                    value={deletePassword}
                                    onChangeText={setDeletePassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}
                            <View style={styles.deleteModalButtons}>
                                <Pressable style={styles.cancelButton} onPress={closeDeleteModal}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.confirmDeleteButton}
                                    onPress={handleDeleteAccount}
                                >
                                    <Text style={styles.confirmDeleteText}>Delete</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={passwordModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closePasswordModal}
                >
                    <View style={appStyles.modalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <Text style={styles.deleteModalTitle}>Add Password Login</Text>
                            <Text style={styles.deleteModalText}>
                                Use {auth.currentUser?.email} with a password next time you sign in.
                            </Text>
                            <TextInput
                                style={styles.deletePasswordInput}
                                placeholder="Password"
                                placeholderTextColor={Colors.italicTextColor}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TextInput
                                style={styles.deletePasswordInput}
                                placeholder="Confirm Password"
                                placeholderTextColor={Colors.italicTextColor}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <View style={styles.deleteModalButtons}>
                                <Pressable style={styles.cancelButton} onPress={closePasswordModal}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.confirmPasswordButton}
                                    onPress={handleAddPasswordLogin}
                                >
                                    <Text style={styles.confirmDeleteText}>Add</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Overlay */}
                {(saving || deleting || addingPassword) && (
                    <View style={appStyles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: Colors.backgroundColor,
        padding: "5%",
    },
    container: {
        ...appStyles.inputContainer,
        paddingVertical: "3%",
        marginVertical: "5%",
        marginTop: "8%",
    },
    labelContainer: {
        flexDirection: "row",
        paddingRight: "5%",
        paddingBottom: 5,
    },
    pressableContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "flex-start",
        rowGap: 5,
        columnGap: 5,
        paddingLeft: 20,
        paddingRight: 16,
        marginBottom: 15,
    },
    textInput: {
        ...appStyles.textInput,
        width: "90%",
        alignSelf: "center",
    },
    labelText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        paddingBottom: 5,
        paddingLeft: "7%",
    },

    pressableBubble: {
        height: 45,
        minWidth: 45*1.5,
        borderRadius: 30,
        backgroundColor: Colors.grayCell,
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center', 
    },
    pressableText: {
        fontSize: 16,
        color: Colors.altBackgroundColor,
    },
    selectedBubble: {
        backgroundColor: Colors.selectedColor,
        ...appStyles.shadow
    },
    selectedBubbleText: {
        color: "white",
        fontWeight: "600"
    },
    optionsStateText: {
        color: Colors.reviewTextColor,
        fontSize: 14,
        paddingVertical: 8,
    },
    buttonContainer: {
        ...appStyles.buttonContainer,
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 75,
    },
    deleteAccountButton: {
        marginTop: 18,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    passwordLoginButton: {
        marginTop: 18,
        width: 220,
    },
    deleteAccountText: {
        color: "#ff8f8f",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    deleteModalContent: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 20,
        width: "80%",
        maxWidth: 420,
        alignItems: "center",
        ...appStyles.shadow,
    },
    deleteModalTitle: {
        color: Colors.selectedTextColor,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    deleteModalText: {
        color: Colors.reviewTextColor,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 15,
    },
    deletePasswordInput: {
        ...appStyles.textInput,
        width: "100%",
        marginBottom: 15,
    },
    deleteModalButtons: {
        flexDirection: "row",
        columnGap: 12,
    },
    cancelButton: {
        backgroundColor: Colors.grayCell,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minWidth: 100,
        alignItems: "center",
    },
    cancelButtonText: {
        color: Colors.altBackgroundColor,
        fontSize: 16,
        fontWeight: "600",
    },
    confirmDeleteButton: {
        backgroundColor: "#b42323",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minWidth: 100,
        alignItems: "center",
    },
    confirmDeleteText: {
        color: Colors.selectedTextColor,
        fontSize: 16,
        fontWeight: "600",
    },
    confirmPasswordButton: {
        backgroundColor: Colors.selectedColor,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minWidth: 100,
        alignItems: "center",
    },
});

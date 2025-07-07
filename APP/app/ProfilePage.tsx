"use client";

import { Text, TextInput, View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions, RefreshControl } from "react-native";
import React, { useEffect, useState } from 'react';
import { PressableBubblesGroup,} from './components/formComponents';
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Colors } from "@/constants/Colors";
import { LogOut } from "./helpers/authHelper";
import { auth } from "@/firebaseConfig";
import { appStyles } from "@/styles/appStyles";
import { fetchUserData, setUserData, useUserDataStore } from "./stores/userDataStore";
import { UserData, UserMinimalData } from "./types/dataTypes";
import { updateUserProfile } from "./helpers/StreamTrack/userHelper";
import { useStreamingServiceDataStore } from "./stores/streamingServiceDataStore";
import { useGenreDataStore } from "./stores/genreDataStore";
import AlertMessage, { Alert } from "./components/alertMessageComponent";

interface ProfilePageParams {
    isSigningUp?: number;
}

export default function ProfilePage() {
    const router = useRouter();

    const { isSigningUp } = useLocalSearchParams() as ProfilePageParams;
    const [isEditing, setIsEditing] = useState<boolean>(!isSigningUp ? false : Number(isSigningUp) === 1 ? true : false);
    const [saving, setSaving] = useState<boolean>(false);

    const { userData } = useUserDataStore();
    const { streamingServiceData } = useStreamingServiceDataStore();
    const { genreData } = useGenreDataStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    // State for text inputs
    const [firstNameText, setFirstNameText] = useState<string>(userData?.user?.firstName ?? "");
    const [lastNameText, setLastNameText] = useState<string>(userData?.user?.lastName ?? "");
    
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

    useEffect(() => {
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
            setIsEditing(false);
        }
    }, [isSigningUp, userData]);

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: Number(isSigningUp) === 1 ? () => null : undefined, // undefined means show the back button. I know its fucking stupid
                    headerBackVisible:  Number(isSigningUp) === 1 ? false : true,
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
                            onChangeText={(newText) => {setFirstNameText(newText); setIsEditing(true);}}
                        />
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Last Name</Text>
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholderTextColor={Colors.italicTextColor}
                            value={lastNameText || ""}
                            onChangeText={(newText) => {setLastNameText(newText); setIsEditing(true);}}
                        />

                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Favorite Genres</Text>
                        </View>
                        <View style={styles.pressableContainer}>
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
                            <Pressable style={appStyles.button} onPress={async () => { await LogOut(auth); router.replace('/LoginPage');}}>
                                <Text style={appStyles.buttonText}>Logout</Text>
                            </Pressable>
                        )}
                    </View>

                </ScrollView>

                {/* Overlay */}
                {saving && (
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
        padding: "4%",
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
    buttonContainer: {
        ...appStyles.buttonContainer,
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 75,
    },
});
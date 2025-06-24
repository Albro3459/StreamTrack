import { Text, TextInput, View, StyleSheet, ScrollView, Image, Pressable, Alert, Dimensions, ActivityIndicator } from "react-native";
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PressableBubblesGroup,} from './components/formComponents';
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Colors } from "@/constants/Colors";
import { dateToString, stringToDate } from "./helpers/dateHelper";
import { Feather } from "@expo/vector-icons";
import { LogOut } from "./helpers/authHelper";
import { auth } from "@/firebaseConfig";
import { appStyles, RalewayFont } from "@/styles/appStyles";
import { setUserData, useUserDataStore } from "./stores/userDataStore";
import { GenreData, UserData } from "./types/dataTypes";
import { updateUserProfile } from "./helpers/StreamTrack/userHelper";
import { useStreamingServiceDataStore } from "./stores/streamingServiceDataStore";
import { useGenreDataStore } from "./stores/genreDataStore";

// const screenWidth = Dimensions.get("window").width;

interface ProfilePageParams {
    isSigningUp?: number;
}

export default function ProfilePage() {
    const router = useRouter();

    const { isSigningUp } = useLocalSearchParams() as ProfilePageParams;
    const [isEditing, setIsEditing] = useState<boolean>(!isSigningUp ? false : Number(isSigningUp) === 1 ? true : false);
    const [saving, setSaving] = useState<boolean>(false);

    const { userData, fetchUserData } = useUserDataStore();
    const { streamingServiceData, fetchStreamingServiceData } = useStreamingServiceDataStore();
    const { genreData, fetchGenreData } = useGenreDataStore();

    // State for text inputs
    const [firstNameText, setFirstNameText] = useState<string | null>(userData?.firstName ?? null);
    const [lastNameText, setLastNameText] = useState<string | null>(userData?.lastName ?? null);
    
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(
        userData?.genres ? new Set(userData.genres.map(g => g.name)) // Objects work weird in sets. Use the strings
            : new Set()
    );

    const [selectedStreamingServices, setSelectedStreamingServices] = useState<Set<string>>(
        userData?.streamingServices ? new Set(userData.streamingServices.map(s => s.name)) // Objects work weird in sets. Use the strings
            : new Set()
    );

    const saveProfile = async (firstName: string | null, lastName: string | null, genres: Set<string>, streamingServices: Set<string>) => {
        setSaving(true);
        const user = auth.currentUser;
        const token = await user?.getIdToken() ?? null;
        const userData: UserData = await updateUserProfile(token, firstName, lastName, genres, streamingServices);
        if (userData) setUserData(userData);
        setIsEditing(false);
        setSaving(false);

        if (Number(isSigningUp) === 1) {
            router.replace('/LandingPage');
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    // headerRight: () => (
                    //     <Pressable
                    //         onPress={() => saveProfile(firstNameText, lastNameText, selectedGenres, selectedStreamingServices)}
                    //         // style={{ marginRight: 16 }} // optional, for spacing
                    //     >
                    //         <Feather name="save" size={28} />
                    //     </Pressable>
                    // ),
                    headerLeft: Number(isSigningUp) === 1 ? () => null : undefined, // undefined means show the back button. I know its fucking stupid
                    headerBackVisible:  Number(isSigningUp) === 1 ? false : true,
                }}
            />
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.background}>
                    {/* First container */}
                    <View style={[styles.container]}>
                        <View style={[styles.labelContainer, {paddingTop: 10}]}>
                            <Text style={styles.labelText}>First Name</Text>
                        </View>
                        <TextInput
                            style={[styles.textField, firstNameText && firstNameText.length > 0 ? styles.selectedTextBox : null]}
                            value={firstNameText || ""}
                            onChangeText={(newText) => {setFirstNameText(newText); setIsEditing(true);}}
                        />
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Last Name</Text>
                        </View>
                        <TextInput
                            style={[styles.textField, lastNameText && lastNameText.length > 0 ? styles.selectedTextBox : null]}
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
                        { isEditing ? (
                            <Pressable style={styles.button} onPress={async () => await saveProfile(firstNameText, lastNameText, selectedGenres, selectedStreamingServices)}>
                                <Text style={styles.buttonText}>Save</Text>
                            </Pressable>
                        ) : (
                            <Pressable style={styles.button} onPress={async () => { await LogOut(auth); router.push('/LoginPage');}}>
                                <Text style={styles.buttonText}>Logout</Text>
                            </Pressable>
                        )}
                    </View>

                    {/* <View style={{ padding: "8%" }}></View> */}
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
    image: {
        width: 300,
        height: 300,
        resizeMode: "contain",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: 100,
        shadowRadius: 10,
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,  // Added for Android compatibility
    },
    topContainer: {
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: -35,
    },
    container: {
        backgroundColor: Colors.cardBackgroundColor,
        paddingVertical: "3%",
        borderRadius: 15,
        marginVertical: "5%",
        marginTop: "10%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
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
        marginBottom: 20,
    },
    textField: {
        backgroundColor: Colors.grayCell,
        width: "90%",
        height: 50,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.cardBackgroundColor,
        padding: 10,
        textAlign: "left",
        alignSelf: "center",
    },
    textBox: {
        backgroundColor: Colors.grayCell,
        width: "90%",
        minHeight: 200,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.cardBackgroundColor,
        padding: 15,
        textAlignVertical: "top",
        alignSelf: "center",
    },
    selectedTextBox: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    nameText: {
        fontSize: 35,
        fontFamily: RalewayFont,
        padding: "1%",
    },
    labelText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: RalewayFont,
        paddingBottom: 5,
        paddingLeft: "7%",
    },
    separatorLine: {
        width: "90%",
        height: 1,
        backgroundColor: "black",
        marginVertical: 10,
        alignSelf: "center",
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
        color: Colors.cardBackgroundColor,
    },
    selectedBubble: {
        backgroundColor: Colors.unselectedColor,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    selectedBubbleText: {
        color: "white"
    },
    buttonContainer: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 75,
        alignItems: "center"
    },
    button: {
        backgroundColor: Colors.unselectedColor,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: 120,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 24,
    },
});
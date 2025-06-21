import { Text, TextInput, View, StyleSheet, ScrollView, Image, Pressable, Alert, Dimensions } from "react-native";
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PressableBubblesGroup,} from './components/formComponents';
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Colors } from "@/constants/Colors";
import { dateToString, stringToDate } from "./helpers/dateHelper";
import { Feather } from "@expo/vector-icons";
import { LogOut } from "./helpers/authHelper";
import { auth } from "@/firebaseConfig";
import { RalewayFont } from "@/styles/appStyles";
import { useUserDataStore } from "./stores/userDataStore";
import { GenreData } from "./types/dataTypes";
import { updateUserProfile } from "./helpers/StreamTrackAPIHelper";

// const screenWidth = Dimensions.get("window").width;

interface ProfilePageParams {
    isSigningUp?: boolean;
}

export default function ProfilePage() {
    const router = useRouter();

    const { isSigningUp } = useLocalSearchParams() as ProfilePageParams;

    //genre options

    const [genreOptions, setGenreOptions] = useState<string[]>(["Action", "Comedy", "Drama", "Horror", "Romance", "Rom-Com", "Sci-Fi", "Thriller", "Western"]);
    const streamingServices: { [key: string]: string } = {
        "Netflix": "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg",
        "Hulu": "https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg",
        "HBO Max": "https://media.movieofthenight.com/services/max/logo-dark-theme.svg",
        "Amazon Prime": "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg",
        "Disney+": "https://media.movieofthenight.com/services/disney/logo-dark-theme.svg",
        "Apple TV": "https://media.movieofthenight.com/services/apple/logo-dark-theme.svg",
        "Paramount+": "https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg",
        "Peacock": "https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg",
    };


    const { userData, fetchUserData } = useUserDataStore();

    // State for text inputs
    const [firstNameText, setFirstNameText] = useState<string | null>(userData?.firstName);
    const [lastNameText, setLastNameText] = useState<string | null>(userData?.lastName);
    
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(
        userData?.genres ? new Set(userData.genres.map(g => g.name)) // Objects work weird in sets. Use the strings
            : new Set()
    );

    const [selectedStreamingServices, setSelectedStreamingServices] = useState<Set<string>>(
        // userData?.streamingServices ? new Set(userData.streamingServices.map(g => g.name)) // Objects work weird in sets. Use the strings
        //     : 
            new Set()
    );

    const saveProfile = (firstName: string, lastName: string, genres: Set<string>, streamingServices: Set<string>) => {

        Alert.alert(
            'Success',
            'Your profile has been updated!',
            [
                {
                    text: 'OK',
                    onPress: async () => {
                        const user = auth.currentUser;
                        const token = await user.getIdToken();
                        await updateUserProfile(token, firstName, lastName, genres, streamingServices);
                        router.push('/LandingPage');
                        // if (Global.justSignedUp) {
                        //     // on sign up
                        //     router.push('/LandingPage');
                        //     Global.justSignedUp = false;
                        //     Global.justSignedIn = true;
                        // } else {
                        //     // regular save
                        //     Global.justSignedUp = false;
                        // }
                    },
                },
            ]
        );
    };

    return (
        <>
            {/* <Stack.Screen
                options={{
                    headerRight: () => (
                        <Pressable
                            onPress={() => saveProfile(firstNameText, lastNameText, selectedGenres, selectedStreamingServices)}
                            // style={{ marginRight: 16 }} // optional, for spacing
                        >
                            <Feather name="save" size={28} />
                        </Pressable>
                    ),
                }}
            /> */}
            <ScrollView style={styles.background}>
                {/* First container */}
                <View style={[styles.container]}>
                    <View style={[styles.labelContainer, {paddingTop: 10}]}>
                        <Text style={styles.labelText}>First Name:</Text>
                        {/* <Text style={{ color: 'red', marginLeft: 2 }}>*</Text> */}
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                        </View>
                    </View>
                    <TextInput
                        style={[styles.textField, firstNameText && firstNameText.length > 0 ? styles.selectedTextBox : null]}
                        value={firstNameText || ""}
                        onChangeText={(newText) => setFirstNameText(newText)}
                    />
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Last Name:</Text>
                        {/* <Text style={{ color: 'red', marginLeft: 2 }}>*</Text> */}
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                        </View>
                    </View>
                    <TextInput
                        style={[styles.textField, lastNameText && lastNameText.length > 0 ? styles.selectedTextBox : null]}
                        value={lastNameText || ""}
                        onChangeText={(newText) => setLastNameText(newText)}
                    />

                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Favorite Genres:</Text>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                        </View>
                    </View>
                    <View style={styles.pressableContainer}>
                        <PressableBubblesGroup
                            labels={genreOptions}
                            selectedLabels={selectedGenres}
                            setLabelState={setSelectedGenres}
                            styles={styles}
                        />
                    </View>

                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Streaming Services:</Text>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                        </View>
                    </View>
                    <View style={styles.pressableContainer}>
                        <PressableBubblesGroup
                            selectedLabels={selectedStreamingServices}
                            setLabelState={setSelectedStreamingServices}
                            styles={styles}
                            services={streamingServices}
                        />
                    </View>
                </View>

                {/* <View style={styles.separatorLine}></View> */}

                {/* Button container */}
                <View style={styles.buttonContainer} >
                    {/* Button */}
                    { isSigningUp ? (
                        <Pressable style={styles.button} onPress={() => saveProfile(firstNameText, lastNameText, selectedGenres, selectedStreamingServices)}>
                            <Text style={{ color: Colors.tabBarColor, fontWeight: "bold", fontSize: 30 }}>Save</Text>
                        </Pressable>
                    ) : (
                        <Pressable style={styles.button} onPress={async () => { await LogOut(auth); router.push('/');}}>
                            <Text style={{ color: Colors.tabBarColor, fontWeight: "bold", fontSize: 30 }}>Logout</Text>
                        </Pressable>
                    )}
                </View>

                {/* <View style={{ padding: "8%" }}></View> */}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: Colors.unselectedColor,
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
        // marginVertical: "5%",
        marginTop: -35,
    },
    container: {
        backgroundColor: "white",
        paddingVertical: "4%",
        borderRadius: 15,
        marginVertical: "5%",
        marginTop: "10%"
    },
    labelContainer: {
        flexDirection: "row",
        paddingRight: "5%",
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
        backgroundColor: Colors.unselectedColor,
        width: "90%",
        height: 50,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.unselectedTextColor,
        padding: 10,
        textAlign: "left",
        alignSelf: "center",
    },
    textBox: {
        backgroundColor: Colors.unselectedColor,
        width: "90%",
        minHeight: 200,
        borderRadius: 15,
        marginBottom: 20,
        fontSize: 18,
        color: Colors.unselectedTextColor,
        padding: 15,
        textAlignVertical: "top",
        alignSelf: "center",
    },
    selectedTextBox: {
        color: "white",
        backgroundColor: Colors.selectedColor,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    nameText: {
        fontSize: 35,
        fontFamily: RalewayFont,
        padding: "1%",
    },
    labelText: {
        color: "black",
        fontSize: 20,
        fontFamily: RalewayFont,
        // alignSelf: "flex-start",
        paddingBottom: 5,
        paddingLeft: "8%",
    },
    separatorLine: {
        width: "90%",
        height: 1,
        backgroundColor: "black",
        marginVertical: 10,
        alignSelf: "center",
    },
    pressableBubble: {
        borderRadius: 30,
        backgroundColor: Colors.unselectedColor,
        padding: "4%",
        justifyContent: 'center',
        alignItems: 'center', 
    },
    pressableText: {
        fontSize: 16,
        color: Colors.unselectedTextColor,
    },
    selectedBubble: {
        backgroundColor: Colors.selectedColor,
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
        backgroundColor: "white",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 10,
        width: 120,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    dateContainer: {
        backgroundColor: Colors.unselectedColor,
        width: "90%",
        height: 50,
        borderRadius: 15,
        marginBottom: 20,
        padding: 10,
        alignContent: "flex-start",
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android
    },
    selectedDateContainer: {
        backgroundColor: Colors.selectedColor,
    },
    datePicker: {
        borderRadius: 15,
        alignSelf: "flex-start",
        overflow: "hidden",
    },
});
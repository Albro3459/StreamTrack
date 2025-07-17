"use client";

import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "../constants/Colors";
import { auth, onAuthStateChanged, User } from "../firebaseConfig";
import { checkIfUserExists } from "./helpers/StreamTrack/userHelper";
import { FetchCache } from "./helpers/cacheHelper";
import AlertMessage, { Alert } from "./components/alertMessageComponent";
import { LogOut } from "./helpers/authHelper";
import { appStyles } from "../styles/appStyles";

export default function Index() {
    const router = useRouter();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const [badUserAccount, setBadUserAccount] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const asyncCheck = async (user: User) => {
                const token = await user.getIdToken();
                const userExists: boolean = await checkIfUserExists(token, setAlertMessage, setAlertType);
                if (userExists) {
                    setBadUserAccount(false);
                    FetchCache(router, token, setAlertMessage, setAlertType);
                    router.replace("/LandingPage");
                } 
                else {
                    setBadUserAccount(true);
                }
            }

            user ? asyncCheck(user) : router.replace("/LoginPage");
        });
        return unsubscribe;
    }, []);
    
    return (
        <View style={styles.container}>
            <AlertMessage
                type={alertType}
                message={alertMessage}
                setMessage={setAlertMessage}
                onIndex={true}
            />
            <Image
                source={require("../assets/images/AppNameImage.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {badUserAccount && (
                <Pressable style={[appStyles.button, {position: "absolute", bottom: 50, alignSelf: "center"}]} onPress={async () => {await LogOut(auth); router.replace('/LoginPage');}}>
                    <Text style={appStyles.buttonText}>Reset App</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: "51%",
        height: 150,
    },
});
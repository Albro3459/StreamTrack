"use client";

import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "../constants/Colors";
import { auth, onAuthStateChanged, User } from "../firebaseConfig";
import { checkIfUserExists } from "./helpers/StreamTrack/userHelper";
import { CACHE, ClearCache, FetchCache } from "./helpers/cacheHelper";
import AlertMessage, { Alert } from "./components/alertMessageComponent";

export default function Index() {
    const router = useRouter();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const asyncCheck = async (user: User) => {
                const token = await user.getIdToken();
                const userExists: boolean = await checkIfUserExists(token, setAlertMessage, setAlertType);
                if (userExists) {
                    FetchCache(router, token, setAlertMessage, setAlertType);
                } 
                else {
                    ClearCache(CACHE.USER);
                    FetchCache(router, null, setAlertMessage, setAlertType, CACHE.POPULAR, CACHE.GENRE, CACHE.STREAMING);
                }
                router.replace("/LandingPage");
            }

            if (user) {
                asyncCheck(user);
            }
            else {
                ClearCache(CACHE.USER);
                FetchCache(router, null, setAlertMessage, setAlertType, CACHE.POPULAR, CACHE.GENRE, CACHE.STREAMING);
                router.replace("/LandingPage");
            }
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
                source={require("../assets/images/AppLogoClear.png")}
                style={styles.logo}
                resizeMode="contain"
            />
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
        width: "100%",
        height: 220,
    },
});

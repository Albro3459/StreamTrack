"use client";

import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/Colors";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { checkIfUserExists } from "./helpers/StreamTrack/userHelper";
import { CACHE, FetchCache } from "./helpers/cacheHelper";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const asyncCheck = async (user: User) => {
                const token = await user.getIdToken();
                const userExists: boolean = await checkIfUserExists(token);
                if (userExists) {
                    FetchCache(token);
                    router.replace("/LandingPage");
                }
            }

            user ? asyncCheck(user) : router.replace("/LoginPage");   
        });
        return unsubscribe;
    }, []);
    
    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/images/AppNameImage.png")}
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
        width: "51%",
        height: 150,
    },
});
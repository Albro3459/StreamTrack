import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { LogOut } from "./helpers/authHelper";
import { useUserDataStore } from "./stores/userDataStore";

export default function Index() {
    const router = useRouter();

    const { userData, fetchUserData } = useUserDataStore();

    const [user, setUser] = useState<User | null>();

    useEffect(() => {
        const fetchInitialKeys = async () => {
            if (user && !userData) {
                const token = await user.getIdToken();
                await fetchUserData(token, user.email);
            }
        };
        fetchInitialKeys();
    }, [user, userData, fetchUserData]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                router.replace("/LandingPage");
                return;
            }
            else {
                router.replace("/LoginPage");
            }
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
        backgroundColor: "#1c2237",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: "51%",
        height: 150,
    },
});
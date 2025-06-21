import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { LogOut } from "./helpers/authHelper";
import { FetchCache } from "./helpers/cacheHelper";

export default function Index() {
    const router = useRouter();

    // const [user, setUser] = useState<User | null>();

    const fetchData = async (user: User) => {
        const token = await user.getIdToken();
        FetchCache(token);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // setUser(user);
                fetchData(user);
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
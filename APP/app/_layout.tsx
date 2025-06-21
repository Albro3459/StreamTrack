"use client";

import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Pressable, Button, TouchableOpacity, View } from "react-native";
import { Fontisto, Feather } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { useEffect } from "react";
import { useFonts, Raleway_800ExtraBold } from '@expo-google-fonts/raleway';
// import { Kurale_400Regular } from '@expo-google-fonts/kurale';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { LogOut } from "./helpers/authHelper";
// import { ClearLoadState, Global } from "@/Global";

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Raleway_800ExtraBold,
        // Kurale_400Regular,
    });

    // const handleInfoPageBackPress = (navigation) => {
    //     // console.log("INFO PAGE BACK PRESS:");

    //     // console.log("Global.backPressLoadSearch:", Global.backPressLoadSearch);
    //     // console.log("Global.searchMovies:", Global.searchMovies);
    //     // console.log("Global.searchFilter:", Global.searchFilter);

    //     // console.log("Global.backPressLoadLibrary:", Global.backPressLoadLibrary);

    //     // console.log("Global.backPressLoadSpinner:", Global.backPressLoadSpinner);
        
    //     if (Global.backPressLoadSearch) {
    //         // Add SearchPage to the stack below the current screen
    //         navigation.reset({
    //         index: 1,
    //         routes: [
    //             { name: "SearchPage" }, // Place SearchPage below
    //             { name: "InfoPage" }, // Current screen
    //         ],
    //         });
    //     }
    //     else if (Global.backPressLoadLibrary) {
    //         // Add Library to the stack below the current screen
    //         navigation.reset({
    //         index: 1,
    //         routes: [
    //             { name: "LibraryPage" }, // Place LibraryPage below
    //             { name: "InfoPage" }, // Current screen
    //         ],
    //         });
    //     }
    //     else if (Global.backPressLoadSpinner) {
    //         // Add Spinner to the stack below the current screen
    //         navigation.reset({
    //             index: 1,
    //             routes: [
    //                 { name: "SpinnerPage" }, // Place SpinnerPage below
    //                 { name: "InfoPage" }, // Current screen
    //             ],
    //             });
    //     }
    //     // Go back to SearchPage, LibraryPage, or SpinnerPage with back animation and state if needed
    //     navigation.goBack();
    // };

    // const handleSpinnerPageBackPress = (navigation) => {
    //     // console.log("SPINNER PAGE BACK PRESS:");

    //     // console.log("Global.backPressLoadLibrary:", Global.backPressLoadLibrary);
        
    //     if (Global.backPressLoadLibrary) {
    //         // Add Library to the stack below the current screen
    //         navigation.reset({
    //         index: 1,
    //         routes: [
    //             { name: "LibraryPage" }, // Place LibraryPage below
    //             { name: "SpinnerPage" }, // Current screen
    //         ],
    //         });
    //     }
    //     // Go back to LibraryPage with back animation and state if needed
    //     navigation.goBack();
    // };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/LandingPage");
                return;
            }
            else {
                router.replace("/LoginPage");
            }
        });
        return unsubscribe;
    }, []);
    
    // Show splash screen until fonts are loaded
    useEffect(() => {
    if (fontsLoaded) {
        SplashScreen.hideAsync();
    }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Prevent rendering until fonts are loaded
    }

    return (
        <Stack>
            <Stack.Screen 
                name="index"
                options={() => ({
                    headerShown: false,
                    animation: 'none'
                })}
            />
            <Stack.Screen 
                name="LoginPage"
                options={() => ({
                    headerShown: false,
                    animation: 'none'
                })}
            />
            <Stack.Screen 
                name="SearchPage" 
                options={() => ({
                    title: "Search", 
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 24,
                        color: "white"
                    },
                    headerStyle: {
                        backgroundColor: Colors.unselectedColor,
                    },
                })}
            />
            <Stack.Screen
                name="LandingPage"
                options={() => ({
                    title: "Stream Track",
                    gestureEnabled: false,
                    headerBackVisible: false,
                    headerTitleStyle: {
                        fontSize: 24,
                        color: "white"
                    },
                    headerStyle: {
                        backgroundColor: Colors.unselectedColor,
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => {
                            // ClearLoadState();
                            router.push('/SearchPage');
                        }}>
                            <Feather name="search" size={28} color="white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push({
                                    pathname: '/ProfilePage',
                                    params: { isSigningUp: 0 }, // Have to pass as number or string
                                })}>
                            <Feather name="user" size={28} color="white" />
                        </TouchableOpacity>
                    ),
                })}
            />

            <Stack.Screen
                name="SpinnerPage"
                options={() => ({
                    title: "Spin to Pick",
                    // gestureEnabled: false,
                    // headerBackVisible: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 24,
                        color: "white"
                    },
                    headerStyle: {
                        backgroundColor: Colors.unselectedColor,
                    },
                    // headerLeft: () => (
                    //     <Pressable onPress={() => handleSpinnerPageBackPress(navigation)}>
                    //         <Feather name="chevron-left" size={32} color="white" />
                    //     </Pressable>
                    // ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            // ClearLoadState();
                            router.replace('/LandingPage');
                        }}>
                            <Feather name="home" size={28} color="white" />
                        </TouchableOpacity>
                    ),
                })}
            />
           

            <Stack.Screen
                name="LibraryPage"
                options={() => ({
                    title: "Library",
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 24,
                        color: "white"
                    },
                    headerStyle: {
                        backgroundColor: Colors.unselectedColor,
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            // Global.backPressLoadLibrary = true;
                            router.push('/SpinnerPage');
                        }}>
                            <Fontisto name="spinner" size={28} color="white" />
                        </TouchableOpacity>
                    ),
                })}
            />
            
            <Stack.Screen 
                name="InfoPage" 
                options={() => ({
                    title: "Info", 
                    headerBackButtonDisplayMode: "minimal",
                    // headerBackVisible: false,
                    // gestureEnabled: false,
                    headerTintColor: "white",
                    headerTitleStyle: {
                        fontSize: 24,
                        color: "white"
                    },
                    headerStyle: {
                        backgroundColor: Colors.unselectedColor,
                    },
                    // headerLeft: () => (
                    //     <Pressable onPress={() => handleInfoPageBackPress(navigation)}>
                    //         <Feather name="chevron-left" size={32} color="white" />
                    //     </Pressable>
                    // ),
                })}
            /> 
            <Stack.Screen 
                name="ProfilePage" 
                options={() => ({
                title: "Profile",
                headerBackButtonDisplayMode: "minimal",
                headerTintColor: "black",
                headerTitleStyle: {
                    fontSize: 24,
                    color: Colors.backgroundColor,
                },
            })}/>
            
        </Stack>
    );
}

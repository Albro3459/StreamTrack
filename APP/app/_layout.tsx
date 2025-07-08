"use client";

import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Pressable, Button, View } from "react-native";
import { Fontisto, Feather } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { useEffect } from "react";
import { useFonts, Raleway_800ExtraBold } from '@expo-google-fonts/raleway';
import { appStyles } from "@/styles/appStyles";
// import { Kurale_400Regular } from '@expo-google-fonts/kurale';

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Raleway_800ExtraBold,
        // Kurale_400Regular,
    });
    
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
                    headerTitleStyle: appStyles.headerTitleStyle,
                    headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
                })}
            />
            <Stack.Screen
                name="LandingPage"
                options={() => ({
                    title: "Stream Track",
                    gestureEnabled: false,
                    headerBackVisible: false,
                    headerTitleStyle: appStyles.headerTitleStyle,
                    headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
                    headerLeft: () => (
                        <Pressable onPress={() => {
                            router.push('/SearchPage');
                        }}>
                            <Feather name="search" size={24} color="white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push({
                                    pathname: '/ProfilePage',
                                    params: { isSigningUp: 0 }, // Have to pass as number or string
                                })}>
                            <Feather name="user" size={24} color="white" />
                        </Pressable>
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
                    headerTitleStyle: appStyles.headerTitleStyle,
                    headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
                    // headerLeft: () => (
                    //     <Pressable onPress={() => handleSpinnerPageBackPress(navigation)}>
                    //         <Feather name="chevron-left" size={32} color="white" />
                    //     </Pressable>
                    // ),
                    headerRight: () => (
                        <Pressable onPress={() => {
                            // ClearLoadState();
                            router.replace('/LandingPage');
                        }}>
                            <Feather name="home" size={24} color="white" />
                        </Pressable>
                    ),
                })}
            />
           

            <Stack.Screen
                name="LibraryPage"
                options={() => ({
                    title: "Library",
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "white",
                    headerTitleStyle: appStyles.headerTitleStyle,
                    headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
                    headerRight: () => (
                        <Pressable onPress={() => {
                            router.push('/SpinnerPage');
                        }}>
                            <Fontisto name="spinner" size={24} color="white" />
                        </Pressable>
                    ),
                })}
            />
            
            <Stack.Screen 
                name="InfoPage" 
                options={() => ({
                    title: "Info", 
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "white",
                    headerTitleStyle: appStyles.headerTitleStyle,
                    headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
                    headerRight: () => (
                        <Pressable onPress={() => {
                            router.replace('/LandingPage');
                        }}>
                            <Feather name="home" size={24} color="white" />
                        </Pressable>
                    ),
                })}
            /> 
            <Stack.Screen 
                name="ProfilePage" 
                options={() => ({
                title: "Profile",
                headerBackButtonDisplayMode: "minimal",
                headerTintColor: "white",
                headerTitleStyle: appStyles.headerTitleStyle,
                headerStyle: {
                        backgroundColor: Colors.selectedColor,
                    },
            })}/>
            
        </Stack>
    );
}

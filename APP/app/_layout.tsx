"use client";

import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Feather } from '@expo/vector-icons';
import { Colors } from "../constants/Colors";
import { useEffect } from "react";
import { useFonts, Raleway_800ExtraBold } from '@expo-google-fonts/raleway';
import { appStyles } from "../styles/appStyles";
import { HeaderButton, hiddenGlassHeaderItem } from "./components/headerButtonComponent";
import AuthRequiredModal from "./components/authRequiredModalComponent";
// import { Kurale_400Regular } from '@expo-google-fonts/kurale';

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();
    const headerIconColor = Colors.selectedTextColor;

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/LandingPage');
        }
    };

    const backButton = (
        <HeaderButton accessibilityLabel="Back" onPress={handleBackPress}>
            <Feather name="chevron-left" size={32} color={headerIconColor} />
        </HeaderButton>
    );

    const homeButton = (
        <HeaderButton accessibilityLabel="Home" onPress={() => router.replace('/LandingPage')}>
            <Feather name="home" size={24} color={headerIconColor} />
        </HeaderButton>
    );

    const searchButton = (
        <HeaderButton accessibilityLabel="Search" onPress={() => router.push('/SearchPage')}>
            <Feather name="search" size={24} color={headerIconColor} />
        </HeaderButton>
    );

    const profileButton = (
        <HeaderButton
            accessibilityLabel="Profile"
            onPress={() => router.push({
                pathname: '/ProfilePage',
                params: { isSigningUp: 0 },
            })}
        >
            <Feather name="user" size={24} color={headerIconColor} />
        </HeaderButton>
    );

    const backButtonOptions = {
        headerLeft: () => backButton,
        unstable_headerLeftItems: () => [hiddenGlassHeaderItem(backButton)],
        headerBackVisible: false,
    };

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
        <>
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: "minimal",
                headerBackButtonMenuEnabled: false,
                headerTintColor: headerIconColor,
                headerTitleStyle: appStyles.headerTitleStyle,
                headerStyle: {
                    backgroundColor: Colors.selectedColor,
                },
            }}
        >
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
                    ...backButtonOptions,
                })}
            />
            <Stack.Screen
                name="LandingPage"
                options={() => ({
                    title: "Stream Tracker",
                    gestureEnabled: false,
                    headerBackVisible: false,
                    headerLeft: () => searchButton,
                    headerRight: () => profileButton,
                    unstable_headerLeftItems: () => [hiddenGlassHeaderItem(searchButton)],
                    unstable_headerRightItems: () => [hiddenGlassHeaderItem(profileButton)],
                })}
            />

            <Stack.Screen
                name="SpinnerPage"
                options={() => ({
                    title: "Spin to Pick",
                    // gestureEnabled: false,
                    // headerBackVisible: false,
                    ...backButtonOptions,
                    // headerLeft: () => (
                    //     <Pressable onPress={() => handleSpinnerPageBackPress(navigation)}>
                    //         <Feather name="chevron-left" size={32} color="white" />
                    //     </Pressable>
                    // ),
                    headerRight: () => homeButton,
                    unstable_headerRightItems: () => [hiddenGlassHeaderItem(homeButton)],
                })}
            />
           

            <Stack.Screen
                name="LibraryPage"
                options={() => ({
                    title: "Library",
                    ...backButtonOptions,
                    // headerRight: () => (
                    //     <Pressable onPress={() => {
                    //         router.push('/SpinnerPage');
                    //     }}>
                    //         <Fontisto name="spinner" size={24} color="white" />
                    //     </Pressable>
                    // ),
                })}
            />
            
            <Stack.Screen 
                name="InfoPage" 
                options={() => ({
                    title: "Info", 
                    ...backButtonOptions,
                    headerRight: () => homeButton,
                    unstable_headerRightItems: () => [hiddenGlassHeaderItem(homeButton)],
                })}
            /> 
            <Stack.Screen 
                name="ProfilePage" 
                options={() => ({
                    title: "Profile",
                    ...backButtonOptions,
                })}
            />
            
        </Stack>
        <AuthRequiredModal />
        </>
    );
}

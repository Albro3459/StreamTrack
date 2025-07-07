"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Carousel from "react-native-reanimated-carousel";
import { Pressable, View, Image, StyleSheet, Text, ScrollView, ActivityIndicator, Dimensions, FlatList, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { appStyles, RalewayFont } from "@/styles/appStyles";
import { useUserDataStore } from "./stores/userDataStore";
import { fetchPopularContent, usePopularContentStore } from "./stores/popularContentStore";
import { ContentSimpleData, ListMinimalData } from "./types/dataTypes";
import MoveModal from "./components/moveModalComponent";
import { isItemInList, moveItemToList, sortLists } from "./helpers/StreamTrack/listHelper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from 'react-native-reanimated';
import { auth } from "@/firebaseConfig";
import AlertMessage, { Alert } from "./components/alertMessageComponent";
import { useFocusEffect } from "@react-navigation/native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LIBRARY_OVERLAY_HEIGHT = screenHeight*.095;

const CAROUSEL_AUTOPLAY_INTERVAL: number = 7500; // in milliseconds, so 1000 === 1 sec

export default function LandingPage () {
    const router = useRouter();
    
    const { userData } = useUserDataStore();
    const { popularContent } = usePopularContentStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const [lists, setLists] = useState<ListMinimalData[] | null>(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));

    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);

    const [selectedContent, setSelectedContent] = useState<ContentSimpleData>(null);

    const [carouselIndex, setCarouselIndex] = useState<number>(0);
    const carouselRef = useRef(null);
    const timerRef = useRef<NodeJS.Timeout | number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchPopularContent(await auth.currentUser.getIdToken());
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const lastIndex = popularContent?.carousel?.length ? popularContent.carousel.length - 1 : 0;
        if (carouselIndex === lastIndex && popularContent?.carousel?.length > 1) {
            // Only start timer if at last slide
            timerRef.current = setTimeout(() => {
                setCarouselIndex(0);
                if (carouselRef.current) {
                    carouselRef.current.scrollTo({ index: 0, animated: false });
                }
            }, CAROUSEL_AUTOPLAY_INTERVAL);
        } else {
            // If index changes away from last slide, clear the timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => { // clean up
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [carouselIndex, popularContent?.carousel?.length]);

    useFocusEffect(
        useCallback(() => {
            if (userData) {
                setLists(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));
            }
        }, [userData])
    );

    useEffect(() => {
        const store = usePopularContentStore.getState(); 
        if (popularContent && lists) {
            setIsLoading(false);
        }
        else if (!lists || (store.loading && !popularContent)) {
            setIsLoading(true);
        }
    }, [popularContent, lists]);

    const handlePress = (content: ContentSimpleData) => {
        router.push({
            pathname: '/InfoPage',
            params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster },
        });
    }

    const handleLongPress = (content: ContentSimpleData) => {
        setSelectedContent(content); setAutoPlay(false); setMoveModalVisible(true);
    }

    const renderCarouselContent = ({ item: content, index } : { item: ContentSimpleData, index: number }) => {
         const tapGesture = Gesture.Tap()
            .onEnd((event) => {
                runOnJS(handlePress)(content);
            });

        const longPressGesture = Gesture.LongPress()
            .minDuration(500)
            .onStart(() => {
                runOnJS(handleLongPress)(content);
            });

        const combinedGesture = Gesture.Exclusive(longPressGesture, tapGesture);
        
        return (
        <GestureDetector gesture={combinedGesture}>
            <View style={styles.slide}>
                <Image
                    source={{ uri: content.horizontalPoster }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                />
            </View>
        </GestureDetector>);
    };

    return (
        <View style={styles.container} >
            <AlertMessage
                type={alertType}
                message={alertMessage}
                setMessage={setAlertMessage}
            />
            
            <ScrollView style={{ marginBottom: LIBRARY_OVERLAY_HEIGHT}} showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.selectedTextColor} // iOS spinner color
                        colors={[Colors.selectedTextColor]} // Android spinner color
                    />
                }
            >
                <Text style={styles.welcomeText}>WELCOME BACK{userData?.user?.firstName?.length > 0 && " "+userData.user.firstName.toUpperCase()}!</Text>
                <View style={{ marginBottom: 24, alignItems: "center" }}>
                    <Carousel<ContentSimpleData>
                        ref={carouselRef}
                        loop={false} // Causes bugs when clicking dots :(
                        width={screenWidth * 0.90}
                        height={screenWidth * 0.50}
                        windowSize={3}
                        autoPlay={autoPlay}
                        autoPlayInterval={CAROUSEL_AUTOPLAY_INTERVAL}
                        data={popularContent?.carousel}
                        scrollAnimationDuration={500}
                        onSnapToItem={setCarouselIndex}
                        renderItem={renderCarouselContent}
                    />
                    {/* Dots below carousel */}
                    <View style={styles.dotsContainer}>
                        {popularContent?.carousel?.map((_, i) => (
                            <Pressable
                                key={i}
                                style={[
                                    styles.dot,
                                    carouselIndex === i && styles.dotActive
                                ]}
                                onPress={() => {
                                    setCarouselIndex(i);
                                    carouselRef.current?.scrollTo({ index: i, animated: true });
                                }}
                            />
                        ))}
                    </View>
                </View>
                
                {/* Sections */}
                {popularContent?.main && Object.entries(popularContent.main).length > 0 ? (
                    Object.entries(popularContent.main).map(([sectionTitle, sectionItems]) =>
                        sectionItems.length > 0 ? (
                        <View key={sectionTitle} style={styles.section}>
                            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                            <FlatList<ContentSimpleData>
                                data={sectionItems}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.tmdbID}
                                contentContainerStyle={styles.railListContent}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.card,
                                            pressed && appStyles.pressed,
                                        ]}
                                        onPress={() => handlePress(item)}
                                        onLongPress={() => handleLongPress(item)}
                                        android_ripple={{ color: Colors.grayCell }}
                                    >
                                        <View style={styles.imageWrapper}>
                                            <Image
                                                source={{ uri: item.verticalPoster || item.horizontalPoster }}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    </Pressable>
                                )}
                            />
                        </View>
                        ) : null
                    )
                    ) : (
                    <View style={styles.nothingFoundContainer}>
                        <Text style={styles.nothingFoundText}>Nothing found.</Text>
                        {/* <Pressable onPress={clearAllFilters} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear Filters</Text>
                        </Pressable> */}
                    </View>
                    )}


            </ScrollView>

            {/* Move Modal */}
            <MoveModal
                selectedContent={selectedContent}
                lists={lists}

                showHeart={true}
                visibility={moveModalVisible}

                setVisibilityFunc={setMoveModalVisible}
                setIsLoadingFunc={setIsLoading}
                setAutoPlayFunc={setAutoPlay}

                moveItemFunc={moveItemToList}
                isItemInListFunc={isItemInList}

                setListsFunc={setLists}
                
                setAlertMessageFunc={setAlertMessage}
                setAlertTypeFunc={setAlertType}
            />
        
            {/* Library Button & Overlay */}
            <View style={styles.libraryOverlay}>
                <Pressable
                    style={styles.libraryButton}
                    onPress={() => router.push('/LibraryPage')} // Navigate to the Library page
                >
                    <Text style={styles.libraryButtonText}>Library</Text>
                </Pressable>
            </View>

            {/* Loading Overlay */}
            {isLoading && (
                <View style={appStyles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    welcomeText: {
        fontSize: 26,
        fontFamily: RalewayFont,
        color: Colors.selectedTextColor,
        marginBottom: 20,
    },

    libraryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: LIBRARY_OVERLAY_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    libraryButton: {
        width: 140,
        paddingVertical: 14,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: Colors.selectedColor,
        alignContent: "center",
        justifyContent: "center",
        ...appStyles.shadow
    },
    libraryButtonText: {
        color: Colors.selectedTextColor,
        fontSize: 18,
        fontWeight: "600",
        textAlign:"center",
    },

    slide: {
        flex: 1,
        borderRadius: 15,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
    },
    titleContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.44)",
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    title: {
        color: Colors.selectedTextColor,
        fontWeight: "600",
        fontSize: 18,
        letterSpacing: 0.2,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        height: 18,
        gap: 8,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 10,
        backgroundColor: Colors.grayCell,
        marginHorizontal: 2,
    },
    dotActive: {
        backgroundColor: Colors.selectedTextColor,
        width: 10,
        height: 10,
    },

    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.selectedTextColor,
        marginBottom: 12,
        paddingLeft: 8,
        letterSpacing: 0.1,
    },
    railListContent: {
        paddingHorizontal: 4,
    },
    card: {
        width: screenWidth * 0.25, // ~9/16 compared to section's minHeight
        marginRight: 15,
        borderRadius: 10,
        backgroundColor: Colors.altBackgroundColor,
        overflow: 'hidden',
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 11 / 16,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: Colors.grayCell,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    cardTitle: {
        color: Colors.selectedTextColor,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 7,
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    nothingFoundContainer: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nothingFoundText: {
        color: Colors.grayCell,
        fontSize: 18,
        marginBottom: 12,
    },
    clearButton: {
        backgroundColor: Colors.selectedColor,
        paddingVertical: 12,
        paddingHorizontal: 26,
        borderRadius: 10,
        marginTop: 5,
    },
    clearButtonText: {
        color: Colors.selectedTextColor,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
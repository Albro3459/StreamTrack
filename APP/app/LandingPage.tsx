import React, { useEffect, useRef, useState } from "react";
import Carousel from "react-native-reanimated-carousel";
import { Pressable, View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { appStyles, RalewayFont } from "@/styles/appStyles";
import { useUserDataStore } from "./stores/userDataStore";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { usePopularContentStore } from "./stores/popularContentStore";
import { ContentSimpleData, ListMinimalData } from "./types/dataTypes";
import { MoveModal } from "./components/moveModalComponent";
import { contentSimpleToPartial } from "./helpers/StreamTrack/contentHelper";
import { isItemInList, moveItemToList, sortLists } from "./helpers/StreamTrack/listHelper";
// import { MoveModal } from "./components/moveModalComponent";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LIBRARY_OVERLAY_HEIGHT = screenHeight*.095;

const CAROUSEL_AUTOPLAY_INTERVAL: number = 2000;

export default function LandingPage () {
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>();
    const { userData } = useUserDataStore();
    const { popularContent } = usePopularContentStore();

    const [lists, setLists] = useState<ListMinimalData[] | null>(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));

    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);

    const [selectedContent, setSelectedContent] = useState<ContentSimpleData>(null);

    const [carouselIndex, setCarouselIndex] = useState<number>(0);
    const carouselRef = useRef(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (userData) {
            setLists(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));
        }
    }, [userData]);

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

    const renderCarouselContent = ({ item: content, index } : { item: ContentSimpleData, index: number }) => (
        <Pressable
            // onPress={() => handlePress(content) }
            onLongPress={() => { handleLongPress(content); }}
            style={styles.slide}
        >
            <Image
                source={{ uri: content.horizontalPoster }}
                style={styles.image}
                resizeMode="cover"
            />
            {/* <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{content.title}</Text>
            </View> */}
        </Pressable>
    );

    return (
        <View style={styles.container} >
            <ScrollView style={{ marginBottom: LIBRARY_OVERLAY_HEIGHT}} showsVerticalScrollIndicator={false}>
                <Text style={styles.welcomeText}>WELCOME BACK{userData?.user?.firstName?.length > 0 && " "+userData.user.firstName.toUpperCase()}!</Text>
                <View style={{ marginBottom: 16, alignItems: "center" }}>
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
                            <TouchableOpacity
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

                {/* Movie Cards */}
                {/* {(!movies || movies.length <= 0) ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: -80 }}>
                        {searchText.length > 0 && showNoResults && !isSearching ? "No Results :(" : "Try Searching for a Show or Movie!"}
                        </Text>
                    </View>
                ) : (
                <FlatList<Movie>
                    ref={flatListRef}
                    data={movies}
                    keyExtractor={(item) => item.tmdbID}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: movie }) => (
                    <Pressable
                        onPress={() => {
                        //   Global.backPressLoadSearch = true;
                            router.push({
                                pathname: '/InfoPage',
                                params: { tmdbID: movie.tmdbID, title: movie.title, year: movie.year, media_type: movie.mediaType, verticalPoster: movie.verticalPoster, horizontalPoster: movie.horizontalPoster },
                            });
                        }}
                        onLongPress={() => {setSelectedMovie(movie); setMoveModalVisible(true);}}
                    >
                        <View style={[appStyles.cardContainer, {marginHorizontal: 16}]}>
                            <Image source={{ uri: movie.verticalPoster }} style={appStyles.cardPoster} />
                            <View style={appStyles.cardContent}>
                                <Text style={appStyles.cardTitle}>{movie.title}</Text>
                                <Text style={appStyles.cardDescription} numberOfLines={4}>{movie.content.overview}</Text>
                                <StarRating rating={movie.rating}/>
                            </View>
                            <Heart 
                                heartColor={isTMDBItemInList(lists, FAVORITE_TAB, movie.fullTMDBID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                                size={40}
                                onPress={async () => await delayedMoveTMDBItemToList(movie, FAVORITE_TAB, lists, setLists, setIsSearching, setMoveModalVisible)}
                            />
                        </View>
                    </Pressable>
                    )}
                />
                )} */}

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
            />
        

            <View style={styles.libraryOverlay}>
                <TouchableOpacity
                    style={styles.libraryButton}
                    onPress={() => router.push('/LibraryPage')} // Navigate to the Library page
                >
                    <Text style={styles.libraryButtonText}>Library</Text>
                </TouchableOpacity>
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
        borderRadius: 18,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    image: {
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
        borderRadius: 4,
        backgroundColor: Colors.grayCell,
        marginHorizontal: 2,
    },
    dotActive: {
        backgroundColor: Colors.selectedTextColor,
        width: 10,
        height: 10,
    }
});
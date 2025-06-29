import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, FlatList, Image, TouchableOpacity, Pressable, Dimensions, Alert, Modal, ActivityIndicator } from "react-native";
import { Card, Title } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { appStyles, RalewayFont } from "@/styles/appStyles";
import { useUserDataStore } from "./stores/userDataStore";
import { User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { StarRating } from "./components/starRatingComponent";
// import { MoveModal } from "./components/moveModalComponent";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LIBRARY_OVERLAY_HEIGHT = screenHeight*.095;

export default function LandingPage () {
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>();
    const { userData } = useUserDataStore();

    const [isLoading, setIsLoading] = useState(false);  

    // (async () => {
    //     const token = await auth.currentUser.getIdToken();
    //     console.log(token);
    // })();

    return (
        <View style={styles.container} >
            <ScrollView style={{ marginBottom: LIBRARY_OVERLAY_HEIGHT}} showsVerticalScrollIndicator={false}>
                <Text style={styles.welcomeText}>WELCOME BACK{userData?.user?.firstName?.length > 0 && " "+userData.user.firstName.toUpperCase()}!</Text>
                {/* Trending Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TRENDING</Text>
                    {/* <Pressable onPress={() => router.push({
                                                pathname: '/InfoPage',
                                                params: { id: carouselContent[carouselIndex]?.id || "10" },
                                })}>
                        <Card style={styles.trendingCard}>
                        <Image source={{ uri: carouselContent[carouselIndex] && carouselContent[carouselIndex].posters.horizontal }} style={styles.trendingImage} />
                        <Card.Content>
                            <Title style={styles.trendingTitle}>
                            {carouselContent && carouselContent[carouselIndex] && carouselContent[carouselIndex].title}
                            </Title>
                        </Card.Content>
                        </Card>
                    </Pressable> */}

                    {/* Circular Navigation Buttons */}
                    <View style={styles.navigationButtons}>
                        <TouchableOpacity
                        //   onPress={handlePreviousMovie}
                        style={styles.circleButton}
                        >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // onPress={handleNextMovie} 
                            style={styles.circleButton}
                        >
                            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                        </TouchableOpacity>
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
            {/* <MoveModal
                selectedItem={selectedMovie}
                lists={lists}
                showHeart={false}
                visibility={moveModalVisible}
                setVisibilityFunc={setMoveModalVisible}
                setIsLoadingFunc={setIsSearching}
                moveItemFunc={delayedMoveTMDBItemToList}
                isItemInListFunc={isTMDBItemInList}
                setListsFunc={setLists}
            /> */}
        

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
    // fontWeight: "bold",
    fontFamily: RalewayFont,
    color: "#fff",
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  trendingCard: {
    backgroundColor: Colors.altBackgroundColor,
    borderRadius: 10,
  },
  trendingImage: {
    height: 200,
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  trendingTitle: {
    color: "#fff",
    top: 8,
    fontFamily: RalewayFont,
    textAlign: "center",
  },

  
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  circleButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.selectedColor,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    ...appStyles.shadow
  },
  movieCard: {
    width: 11*7,
    marginRight: 15,
    overflow: "hidden"
  },
  movieImage: {
    height: 16*7,
    aspectRatio: 11 / 16,
    borderRadius: 8,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  filterSection: {
    backgroundColor: Colors.altBackgroundColor,
    padding: 20,
    borderRadius: 10,
    marginBottom: 50
  },
  filterOptions: {
    marginTop: 10,
  },
  filterText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: Colors.selectedColor,
    width: 125,
    height: 50,
    borderRadius: 10,

    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 60,    
    
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
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
    color: '#fff',
    fontSize: 18,
    fontWeight: "600",
    textAlign:"center",
  },
});
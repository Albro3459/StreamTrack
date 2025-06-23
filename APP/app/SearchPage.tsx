import { Colors } from '@/constants/Colors';
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { router } from 'expo-router';
import { appStyles } from '@/styles/appStyles';
import { Feather } from '@expo/vector-icons';
import { TMDBSearch } from './helpers/contentAPIHelper';
import { TMDB_Content, TMDB, MEDIA_TYPE } from './types/tmdbType';
import { useUserDataStore } from './stores/userDataStore';
import { ListData } from './types/dataTypes';
import { FAVORITE_TAB, findAndMoveTMDBItemToList, isTMDBItemInList } from './helpers/StreamTrack/listHelper';

export type Movie = {
    fullTMDBID: string;
    tmdbID: string;
    title: string;
    mediaType: MEDIA_TYPE;
    rating: number;
    verticalPoster: string; 
    horizontalPoster: string;
    content: TMDB_Content | null;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SearchPage() {    
    const { userData } = useUserDataStore();

    const flatListRef = useRef<FlatList>(null);
    const searchInputRef = useRef<TextInput>(null);  

    
    const [isSearching, setIsSearching] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);


    const [searchText, setSearchText] = useState('');

    const [moveModalVisible, setMoveModalVisible] = useState(false);


    // const [heartColors, setHeartColors] = useState<{ [key: string]: string }>();

    const [lists, setLists] = useState<ListData[] | null>([...userData.listsOwned, ...userData.listsSharedWithMe]);

    const [selectedMovie, setSelectedMovie] = useState<Movie>(null);

    const [movies, setMovies] = useState<Movie[]>([]);

    const search = async (searchText: string) => {
        setShowNoResults(true);
        if (searchText.length > 0) {
            setIsSearching(true);
            const contents: TMDB = await TMDBSearch(searchText);
            const movies: Movie[] = contents.results.map(content => {
                return {
                    fullTMDBID: content.media_type+"/"+content.id.toString(),
                    tmdbID: content.id.toString(),
                    title: content.media_type === "movie" ? content.title : content.name,
                    mediaType: content.media_type,
                    rating:  parseFloat((content.vote_average/2).toFixed(2)), // rating is on 10 pt scale so this converts to 5 star scale
                    verticalPoster: content.poster_path, 
                    horizontalPoster: content.backdrop_path,
                    content: content,
                }
            });
            setMovies(movies);
            setIsSearching(false);
        }
    };

    return (
        <Pressable style={{height: screenHeight-70}} onPress={Keyboard.dismiss}>
            <View style={[styles.container]}>
                {/* Search Bar */}
                <View style={{flexDirection: "row", columnGap: 10, justifyContent: "center"}} >
                    <Pressable 
                        style={{paddingTop: 5}} 
                        onPress={async () => await search(searchText)}
                    >
                        <Feather name="search" size={28} color="white" />
                    </Pressable>
                    <TextInput
                        ref={searchInputRef}
                        style={[styles.searchBar, {flex: 1}]}
                        placeholder="Search for a movie or TV show..."
                        placeholderTextColor={Colors.reviewTextColor}
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            if (showNoResults === true) setShowNoResults(false);
                        }}
                        onSubmitEditing={async () => await search(searchText) /* Search on enter key press */ }
                        returnKeyType="search" // makes the return key say search
                        clearButtonMode='while-editing'
                        autoFocus
                    />
                </View>

                {/* Movie Cards */}
                {(!movies || movies.length <= 0) ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: -80 }}>
                        {searchText.length > 0 && showNoResults && !isSearching ? "No Results :(" : "Try Searching for a Show or Movie!"}
                        </Text>
                    </View>
                ) : (
                <FlatList<Movie>
                    ref={flatListRef}
                    data={movies}
                    keyExtractor={(item) => item.tmdbID}
                    renderItem={({ item: movie }) => (
                    <Pressable
                        onPress={() => {
                        //   Global.backPressLoadSearch = true;
                            router.push({
                                pathname: '/InfoPage',
                                params: { id: movie.tmdbID, media_type: movie.content.media_type, vertical: movie.verticalPoster, horizontal: movie.horizontalPoster },
                            });
                        }}
                        onLongPress={() => {setSelectedMovie(movie); setMoveModalVisible(true);}}
                    >
                        <View style={appStyles.cardContainer}>
                            <Image source={{ uri: movie.verticalPoster }} style={appStyles.cardPoster} />
                            <View style={appStyles.cardContent}>
                                <Text style={appStyles.cardTitle}>{movie.title}</Text>
                                <Text style={appStyles.cardDescription}>{movie.content.overview}</Text>
                                <Text style={appStyles.cardRating}>⭐ {movie.rating}</Text>
                            </View>
                            <Heart 
                                heartColor={isTMDBItemInList(lists, FAVORITE_TAB, movie.fullTMDBID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                                size={40}
                                onPress={async () => await findAndMoveTMDBItemToList(selectedMovie, FAVORITE_TAB, lists, setLists, setIsSearching, setMoveModalVisible)}
                            />
                        </View>
                    </Pressable>
                    )}
                />
                )}

                {/* Move Modal */}
                {selectedMovie && (
                    <Modal
                        transparent={true}
                        visible={moveModalVisible}
                        animationType="fade"
                        onRequestClose={() => setMoveModalVisible(false)}
                    >
                        <Pressable
                            style={appStyles.modalOverlay}
                            onPress={() => setMoveModalVisible(false)}
                        >
                            <View style={appStyles.modalContent}>
                            <Text style={appStyles.modalTitle}>
                                Move to:
                            </Text>
                            {selectedMovie && (
                                <>
                                {/* Render all tabs except FAVORITE_TAB */}
                                {lists
                                    .filter((list) => list.listName !== FAVORITE_TAB)
                                    .map((list, index) => (
                                    <TouchableOpacity
                                        key={`LandingPage-${selectedMovie.tmdbID}-${list}-${index}`}
                                        style={[
                                            appStyles.modalButton,
                                            isTMDBItemInList(lists, list.listName, selectedMovie.fullTMDBID) && appStyles.selectedModalButton,
                                        ]}
                                        onPress={async () => await findAndMoveTMDBItemToList(selectedMovie, list.listName, lists, setLists, setIsSearching, setMoveModalVisible)}
                                    >
                                        <Text style={appStyles.modalButtonText}>
                                            {list.listName} {isTMDBItemInList(lists, list.listName, selectedMovie.fullTMDBID) ? "✓" : ""}
                                        </Text>
                                    </TouchableOpacity>
                                    ))}

                                {/* Render FAVORITE_TAB at the bottom */}
                                {lists.find(l => l.listName === FAVORITE_TAB) && (
                                <View
                                    key={`LandingPage-${selectedMovie.tmdbID}-heart`}
                                    style={{ paddingTop: 10 }}
                                    >
                                    <Heart
                                        heartColor={isTMDBItemInList(lists, FAVORITE_TAB, selectedMovie.fullTMDBID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                                        size={35}
                                        onPress={async () => await findAndMoveTMDBItemToList(selectedMovie, FAVORITE_TAB, lists, setLists, setIsSearching, setMoveModalVisible)}
                                    />
                                </View>
                                )}
                                </>
                            )}
                            </View>
                        </Pressable>
                    </Modal>
                )}

                {/* Loading Overlay */}
                {isSearching && (
                    <View style={appStyles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        padding: 16,
        paddingTop: 35,
        paddingBottom: 70
    },
    searchBar: {
        backgroundColor: Colors.cardBackgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        color: '#FFFFFF',
        marginBottom: 20,
        fontSize: 16,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: '#222',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
});
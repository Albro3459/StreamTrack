import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, Pressable, Keyboard, Dimensions, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { useRouter } from 'expo-router';
import { appStyles } from '@/styles/appStyles';
import { Feather } from '@expo/vector-icons';
import { TMDBSearch } from './helpers/contentAPIHelper';
import { TMDB_Content, TMDB, MEDIA_TYPE } from './types/tmdbType';
import { useUserDataStore } from './stores/userDataStore';
import { ListData } from './types/dataTypes';
import { delayedMoveTMDBItemToList, FAVORITE_TAB, isTMDBItemInList, PartialListData } from './helpers/StreamTrack/listHelper';
import { MOVE_MODAL_DATA_ENUM, MoveModal } from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';

export type Movie = {
    fullTMDBID: string;
    tmdbID: string;
    title: string;
    year: string;
    mediaType: MEDIA_TYPE;
    rating: number;
    verticalPoster: string; 
    horizontalPoster: string;
    content: TMDB_Content | null;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SearchPage() {    
    const router = useRouter();
    
    const { userData } = useUserDataStore();

    const flatListRef = useRef<FlatList>(null);
    const searchInputRef = useRef<TextInput>(null);  

    
    const [isSearching, setIsSearching] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);


    const [searchText, setSearchText] = useState('');

    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const [lists, setLists] = useState<PartialListData[] | null>([...userData.listsOwned, ...userData.listsSharedWithMe]);

    const [selectedMovie, setSelectedMovie] = useState<Movie>(null);

    const [movies, setMovies] = useState<Movie[]>([]);

    const search = async (searchText: string) => {
        setShowNoResults(true);
        if (searchText.length > 0) {
            try {
                setIsSearching(true);
                const contents: TMDB = await TMDBSearch(searchText);
                const movies: Movie[] = contents.results.map(content => {
                    return {
                        fullTMDBID: content.media_type+"/"+content.id.toString(),
                        tmdbID: content.id.toString(),
                        title: content.media_type === "movie" ? content.title : content.name,
                        year: content.release_date ? content.release_date.split("-")[0] : "1999",
                        mediaType: content.media_type,
                        rating:  parseFloat((content.vote_average/2).toFixed(2)), // rating is on 10 pt scale so this converts to 5 star scale
                        verticalPoster: content.poster_path, 
                        horizontalPoster: content.backdrop_path,
                        content: content,
                    }
                });
                setMovies(movies);
            } finally {
                if (flatListRef.current && movies && movies.length > 0) {
                    flatListRef.current.scrollToOffset({ animated: true, offset: 0});
                }
                setIsSearching(false);
            }
        }
    };

    return (
        <Pressable style={{height: screenHeight-70}} onPress={Keyboard.dismiss}>
            <View style={[styles.container]}>
                {/* Search Bar */}
                <View style={[styles.searchBarContainer, {paddingHorizontal: 16}]} >
                    <Pressable 
                        style={{paddingTop: 5,  ...appStyles.shadow}} 
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
                )}

                <MoveModal
                    dataType={MOVE_MODAL_DATA_ENUM.TMDB}
                    selectedItem={selectedMovie}
                    lists={lists}
                    showHeart={false}
                    visibility={moveModalVisible}
                    setVisibilityFunc={setMoveModalVisible}
                    setIsLoadingFunc={setIsSearching}
                    moveItemFunc={delayedMoveTMDBItemToList}
                    isItemInListFunc={isTMDBItemInList}
                    setListsFunc={setLists}
                />

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
        // paddingHorizontal: 16, // Let the children handle this themselves because otherwise the shadow gets cutoff
        paddingTop: 35,
        paddingBottom: 70
    },
    searchBarContainer: { 
        flexDirection: "row", 
        columnGap: 10, 
        justifyContent: "center",
        ...appStyles.shadow 
    },
    searchBar: {
        backgroundColor: Colors.altBackgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        color: '#FFFFFF',
        marginBottom: 20,
        fontSize: 16,
    },
});
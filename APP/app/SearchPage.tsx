"use client";

import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, Pressable, Keyboard, Dimensions, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { useRouter } from 'expo-router';
import { appStyles } from '@/styles/appStyles';
import { Feather } from '@expo/vector-icons';
import { TMDBSearch } from './helpers/contentAPIHelper';
import { TMDB_Content, TMDB, TMDB_MEDIA_TYPE } from './types/tmdbType';
import { useUserDataStore } from './stores/userDataStore';
import { ContentPartialData, ListData, ListMinimalData } from './types/dataTypes';
import { FAVORITE_TAB, isItemInAnyList, isItemInList, moveItemToList, sortLists } from './helpers/StreamTrack/listHelper';
import MoveModal from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';

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

    const [lists, setLists] = useState<ListMinimalData[] | null>([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]);

    const [selectedContent, setSelectedContent] = useState<ContentPartialData>(null);

    const [contents, setContents] = useState<ContentPartialData[]>([]);

    const search = async (searchText: string) => {
        setShowNoResults(true);
        if (searchText.length > 0) {
            try {
                setIsSearching(true);
                const tmdbContents: TMDB = await TMDBSearch(searchText);
                const contents: ContentPartialData[] = tmdbContents.results.map(tmdbContent => {
                    return {
                        tmdbID: tmdbContent.media_type+"/"+tmdbContent.id.toString(),
                        title: tmdbContent.media_type === "movie" ? tmdbContent.title : tmdbContent.name,
                        overview: tmdbContent.overview,
                        rating:  parseFloat((tmdbContent.vote_average/2).toFixed(2)) ?? 0, // rating is on 10 pt scale so this converts to 5 star scale
                        releaseYear: tmdbContent.release_date ? parseInt(tmdbContent.release_date.split("-")[0]) : 0,
                        verticalPoster: tmdbContent.poster_path, 
                        horizontalPoster: tmdbContent.backdrop_path,
                    }
                });
                setContents(contents);
            } finally { // Scroll back up to top
                if (flatListRef.current && contents && contents.length > 0) {
                    flatListRef.current.scrollToOffset({ animated: true, offset: 0});
                }
                setIsSearching(false);
            }
        }
    };

    useEffect(() => {
        if (userData) {
            setLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]);
        }
    }, [userData]);

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
                {(!contents || contents.length <= 0) ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: -80 }}>
                        {searchText.length > 0 && showNoResults && !isSearching ? "No Results :(" : "Try Searching for a Show or Movie!"}
                        </Text>
                    </View>
                ) : (
                <FlatList<ContentPartialData>
                    ref={flatListRef}
                    data={contents}
                    keyExtractor={(item) => item.tmdbID}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: content }) => (
                    <Pressable
                        onPress={() => {
                        //   Global.backPressLoadSearch = true;
                            router.push({
                                pathname: '/InfoPage',
                                params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster },
                            });
                        }}
                        onLongPress={() => {setSelectedContent(content); setMoveModalVisible(true);}}
                    >
                        <View style={[appStyles.cardContainer, {marginHorizontal: 16}]}>
                            <Image source={{ uri: content.verticalPoster }} style={appStyles.cardPoster} />
                            <View style={appStyles.cardContent}>
                                <Text style={appStyles.cardTitle}>{content.title}</Text>
                                <Text style={appStyles.cardDescription} numberOfLines={4}>{content.overview}</Text>
                                <StarRating rating={content.rating}/>
                            </View>
                            <Heart 
                                heartColor={isItemInList(lists, FAVORITE_TAB, content.tmdbID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                                size={40}
                                onPress={async () => await moveItemToList(content, FAVORITE_TAB, lists, setLists, setIsSearching, setMoveModalVisible)}
                            />
                        </View>
                    </Pressable>
                    )}
                />
                )}

                <MoveModal
                    selectedContent={selectedContent}
                    lists={lists}
                    showHeart={false}
                    visibility={moveModalVisible}
                    setVisibilityFunc={setMoveModalVisible}
                    setIsLoadingFunc={setIsSearching}
                    moveItemFunc={moveItemToList}
                    isItemInListFunc={isItemInList}
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
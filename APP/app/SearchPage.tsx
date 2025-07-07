"use client";

import { Colors } from '@/constants/Colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, Pressable, Keyboard, Dimensions, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import { appStyles } from '@/styles/appStyles';
import { Feather } from '@expo/vector-icons';
import { TMDBSearch } from './helpers/tmdbAPIHelper';
import { TMDB } from './types/tmdbType';
import { useUserDataStore } from './stores/userDataStore';
import { ContentData, ContentPartialData, ContentSimpleData, ListMinimalData } from './types/dataTypes';
import { FAVORITE_TAB, isItemInAnyList, isItemInList, moveItemToList, sortLists } from './helpers/StreamTrack/listHelper';
import MoveModal from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';
import AlertMessage, { Alert } from './components/alertMessageComponent';
import { useContentCacheStore } from './stores/contentCacheStore';
import { useFocusEffect } from '@react-navigation/native';
import { getPoster } from './helpers/StreamTrack/contentHelper';
import { usePopularContentStore } from './stores/popularContentStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SearchPage() {    
    const router = useRouter();
    
    const { userData } = useUserDataStore();
    const { contentCache } = useContentCacheStore();
    const { popularContent } = usePopularContentStore();
    
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const flatListRef = useRef<FlatList>(null);
    const searchInputRef = useRef<TextInput>(null);  
    
    const [isSearching, setIsSearching] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);

    const [searchText, setSearchText] = useState('');

    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const [lists, setLists] = useState<ListMinimalData[] | null>([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]);

    const [selectedContent, setSelectedContent] = useState<ContentPartialData>(null);

    const [contents, setContents] = useState<ContentPartialData[]>([]);

    const debouncedSearch = useRef(
        debounce(async (text) => {
            await search(text); // await works here
        }, 400)
    ).current;

    const noResultsOrTrySearching: (searchText: string, showNoResults: boolean, isSearching: boolean) => boolean = (
        searchText: string, showNoResults: boolean, isSearching: boolean
    ) => { 
            return searchText.length > 0 && showNoResults && !isSearching
    };

    const search = async (searchText: string) => {
        searchText = searchText?.trim();
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
                        largeVerticalPoster: tmdbContent.large_poster_path ?? "",
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

    useFocusEffect(
        useCallback(() => {
            if (userData) {
                setLists(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));
            }
        }, [userData])
    );

    useEffect(() => {
        const store = usePopularContentStore.getState(); 
        if (popularContent && !isSearching) {
            setIsSearching(false); // loading but whatever
        }
        else if (store.loading && !popularContent) {
            setIsSearching(true);
        }
    }, [popularContent, isSearching]);

    return (
        <Pressable style={{height: screenHeight-70}} onPress={Keyboard.dismiss}>
            <View style={[styles.container]}>
                <AlertMessage
                    type={alertType}
                    message={alertMessage}
                    setMessage={setAlertMessage}
                />
                {/* Search Bar */}
                <View style={[styles.searchBarContainer, {paddingHorizontal: 16}]} >
                    <Pressable 
                        style={{...appStyles.shadow}} 
                        onPress={async () => await search(searchText)}
                    >
                        <Feather name="search" size={24} color="white" />
                    </Pressable>
                    <TextInput
                        ref={searchInputRef}
                        style={[styles.searchBar, {flex: 1}]}
                        placeholder="Search for a movie or TV show..."
                        placeholderTextColor={Colors.reviewTextColor}
                        value={searchText}
                        onChangeText={text => {
                            setSearchText(text);
                            if (showNoResults) setShowNoResults(false);
                            debouncedSearch(text); // search while typing :)
                        }}
                        onSubmitEditing={async () => await search(searchText) /* Search on enter key press */ }
                        returnKeyType="search" // makes the return key say search
                        clearButtonMode='while-editing'
                        autoFocus={(!contentCache || contentCache.length <= 0) && (!popularContent?.search || popularContent?.search.length <= 0)}
                    />
                </View>

                {/* Recommended && Recently Viewed && Search Results */}
                {(!contents || contents.length <= 0) ? 
                    (!contentCache || contentCache.length <= 0) || noResultsOrTrySearching(searchText, showNoResults, isSearching) ? (
                        (!popularContent?.search ? 
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                                <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: -80 }}>
                                {noResultsOrTrySearching(searchText, showNoResults, isSearching) ? "No Results :(" : "Try Searching for a Show or Movie!"}
                                </Text>
                            </View>
                            :
                            <View style={{paddingHorizontal: 55, height: screenHeight-230}}>
                                <Text style={[styles.sectionTitle, {paddingBottom: 10}]}>Recommended</Text>
                                <FlatList<ContentSimpleData>
                                    ref={flatListRef}
                                    data={popularContent?.search}
                                    keyExtractor={(item) => item.tmdbID}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item: content }) => (
                                    <Pressable
                                        style={({ pressed }) => [
                                            pressed && appStyles.pressed,
                                        ]}
                                        onPress={() => {
                                            router.push({
                                                pathname: '/InfoPage',
                                                params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, largeVerticalPoster: content.largeVerticalPoster, horizontalPoster: content.horizontalPoster },
                                            });
                                        }}
                                        onLongPress={() => {setSelectedContent(content); setMoveModalVisible(true);}}
                                    >
                                        <View style={[appStyles.cardContainer]}>
                                            <Image source={getPoster(content)} style={[appStyles.cardPoster, {height: 70, borderRadius: 7}]} />
                                            <View style={[
                                                appStyles.cardContent,
                                                {
                                                    flexDirection: "column",
                                                    minHeight: 70,
                                                }
                                                ]}>
                                            <View style={{flex: 1, justifyContent: "center"}}>
                                                    <Text style={[appStyles.cardTitle, {marginBottom: 0, marginTop: 10}]} numberOfLines={2}>{content.title}</Text>
                                                </View>
                                                <View style={{flex: 1}} />
                                                <StarRating rating={content.rating}/>
                                            </View>
                                            <Heart 
                                                isSelected={() => isItemInList(lists, FAVORITE_TAB, content?.tmdbID)}
                                                size={30}
                                                onPress={async () => await moveItemToList(content, FAVORITE_TAB, lists, setLists, setIsSearching, () => {}, () => {}, setAlertMessage, setAlertType)}
                                            />
                                        </View>
                                    </Pressable>
                                    )}
                                />
                            </View>
                        )
                    ) : (
                        <View style={{paddingHorizontal: 55, height: screenHeight-230}}>
                            <Text style={[styles.sectionTitle, {paddingBottom: 10}]}>Recently Viewed</Text>
                            <FlatList<ContentData>
                                ref={flatListRef}
                                data={contentCache?.map(i => i.content)}
                                keyExtractor={(item) => item.tmdbID}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item: content }) => (
                                <Pressable
                                    style={({ pressed }) => [
                                        pressed && appStyles.pressed,
                                    ]}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/InfoPage',
                                            params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, largeVerticalPoster: content.largeVerticalPoster, horizontalPoster: content.horizontalPoster },
                                        });
                                    }}
                                    onLongPress={() => {setSelectedContent(content); setMoveModalVisible(true);}}
                                >
                                    <View style={[appStyles.cardContainer]}>
                                        <Image source={getPoster(content)} style={[appStyles.cardPoster, {height: 70, borderRadius: 7}]} />
                                        <View style={[
                                            appStyles.cardContent,
                                            {
                                                flexDirection: "column",
                                                minHeight: 70,
                                            }
                                            ]}>
                                           <View style={{flex: 1, justifyContent: "center"}}>
                                                <Text style={[appStyles.cardTitle, {marginBottom: 0, marginTop: 10}]} numberOfLines={2}>{content.title}</Text>
                                            </View>
                                            <View style={{flex: 1}} />
                                            <StarRating rating={content.rating}/>
                                        </View>
                                        <Heart 
                                            isSelected={() => isItemInList(lists, FAVORITE_TAB, content?.tmdbID)}
                                            size={30}
                                            onPress={async () => await moveItemToList(content, FAVORITE_TAB, lists, setLists, setIsSearching, () => {}, () => {}, setAlertMessage, setAlertType)}
                                        />
                                    </View>
                                </Pressable>
                                )}
                            />
                        </View>
                    )
                : (
                <FlatList<ContentPartialData>
                    ref={flatListRef}
                    data={contents}
                    keyExtractor={(item) => item.tmdbID}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: content }) => (
                    <Pressable
                        style={({ pressed }) => [
                            pressed && appStyles.pressed,
                        ]}
                        onPress={() => {
                            router.push({
                                pathname: '/InfoPage',
                                params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, largeVerticalPoster: content.largeVerticalPoster, horizontalPoster: content.horizontalPoster },
                            });
                        }}
                        onLongPress={() => { setSelectedContent(content); setMoveModalVisible(true);}}
                    >
                        <View style={[appStyles.cardContainer, {marginHorizontal: 16}]}>
                            <Image source={getPoster(content)} style={[appStyles.cardPoster, {width: 60}]} />
                            <View style={appStyles.cardContent}>
                                <Text style={appStyles.cardTitle}>{content.title}</Text>
                                <Text style={appStyles.cardDescription} numberOfLines={3}>{content.overview}</Text>
                                <StarRating rating={content.rating}/>
                            </View>
                            <Heart 
                                isSelected={() => isItemInList(lists, FAVORITE_TAB, content?.tmdbID)}
                                size={35}
                                onPress={async () => await moveItemToList(content, FAVORITE_TAB, lists, setLists, setIsSearching, () => {}, () => {}, setAlertMessage, setAlertType)}
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
                    
                    setAlertMessageFunc={setAlertMessage}
                    setAlertTypeFunc={setAlertType}
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
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center",
        ...appStyles.shadow 
    },
    searchBar: {
        backgroundColor: Colors.altBackgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        color: '#FFFFFF',
        fontSize: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 8,
      color: 'white',
    },
});
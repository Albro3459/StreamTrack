"use client";

import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Dimensions, Linking, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import Heart from './components/heartComponent';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { appStyles, RalewayFont } from '@/styles/appStyles';
import { SvgUri } from 'react-native-svg';
import { TMDB_MEDIA_TYPE } from './types/tmdbType';
import { ContentData, ContentInfoData, ContentPartialData, ContentRequestData, ListMinimalData, StreamingOptionData } from './types/dataTypes';
import { setUserData, useUserDataStore } from './stores/userDataStore';
import { FAVORITE_TAB, handleCreateNewTab, isItemInList, moveItemToList } from './helpers/StreamTrack/listHelper';
import MoveModal from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';
import { getContentInfo, getPoster } from './helpers/StreamTrack/contentHelper';
import { auth } from '@/firebaseConfig';
import { getCachedContent, useContentDataStore } from './stores/contentDataStore';
import AlertMessage, { Alert } from './components/alertMessageComponent';
import CreateNewListModal from './components/createNewListComponent';

const screenWidth = Dimensions.get("window").width;

interface InfoPageParams {
    tmdbID?: string;
    verticalPoster?: string;
    horizontalPoster?: string;
}

export default function InfoPage() {
    const router = useRouter();

    const { tmdbID, verticalPoster, horizontalPoster } = useLocalSearchParams() as InfoPageParams;

    const { userData } = useUserDataStore();
    const { cacheContent } = useContentDataStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const [lists, setLists] = useState<ListMinimalData[] | null>([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]);

    const [info, setInfo] = useState<ContentInfoData | null>();
    const [selectedRecommendation, setSelectedRecommendation] = useState<ContentPartialData>(null);

    const [isLoading, setIsLoading] = useState(true);
    
    const [listModalVisible, setListModalVisible] = useState(false);
    const [recommendedListModalVisible, setRecommendedListModalVisible] = useState(false);

    const [newListName, setNewListName] = useState<string>("");
    const [createListModalVisible, setCreateListModalVisible] = useState(false);

    const [activeTab, setActiveTab] = useState<string>('About');

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const updatedInfo: ContentInfoData = await getContentInfo(await auth.currentUser.getIdToken(), 
                                                                        { tmdbID: info?.content?.tmdbID, 
                                                                            VerticalPoster: info?.content?.verticalPoster, 
                                                                            HorizontalPoster: info?.content?.horizontalPoster
                                                                        } as ContentRequestData, 
                                                                        setAlertMessage, setAlertType,
                                                                        true // REFRESH
                                                                );
            if (updatedInfo) {
                if (updatedInfo.content.tmdbID !== info.content.tmdbID) {
                    console.warn("TMDB ID changed on refresh somehow");
                    if (setAlertMessage) setAlertMessage('Error refreshing content'); 
                    if (setAlertType) setAlertType(Alert.Error);
                    return;
                }
                setInfo(updatedInfo);
                setActiveTab('About');

                // Update User Data
                if (userData?.contents.map(c => c.tmdbID).includes(updatedInfo.content.tmdbID)) {
                    const newContents = [...userData.contents.map(c =>
                        c.tmdbID === info.content.tmdbID ? {...updatedInfo.content} : {...c}
                    )];
                    setUserData({
                        ...userData,
                        contents: newContents
                    });
                }

                // Update Cache
                cacheContent(updatedInfo);
            }
        } finally {
            setRefreshing(false);
        }
    };

    const getServicePrice = (option: StreamingOptionData) : string => {
        if (option && option.streamingService && option.price) {
            const priceAmount = parseFloat(option.price);
            if (!isNaN(priceAmount)) {
                return priceAmount === 0 ? "0" : `From $${priceAmount.toFixed(2)}`
            }
        }
        return "0";
    };

    const toHoursAndMinutes = (runtime: number) => {
        if (!runtime) { return "N/A" }
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    };

    const getRuntime = (content: ContentData): string => {
        return (!content ? 
                    (tmdbID.split('/')[0] === TMDB_MEDIA_TYPE.MOVIE ? "0h 0m" : "Seasons: 5  |  Episodes: 10") 
                    : (
                        content.showType === 'movie' ? (
                        content.runtime ? toHoursAndMinutes(content.runtime) : ""
                    ) : (
                        content.seasonCount && content.episodeCount ? `Seasons: ${content.seasonCount}  |  Episodes: ${content.episodeCount}` : ""
                )));
    };

    const handlePress = (content: ContentPartialData) => {
        router.push({
            pathname: '/InfoPage',
            params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster },
        });
    }
    
    const handleLongPress = (content: ContentPartialData) => {
        setSelectedRecommendation(content); setRecommendedListModalVisible(true);
    }

    useEffect(() => {
        const fetchContent = async () => {
            if (!tmdbID) return;

            const token = await auth.currentUser.getIdToken();
    
            let content: ContentInfoData | null = getCachedContent(tmdbID);

            try {
                if (!content) {
                    content = await getContentInfo(token, {tmdbID:tmdbID, VerticalPoster:verticalPoster, HorizontalPoster:horizontalPoster} as ContentRequestData, setAlertMessage, setAlertType);
                }
            } finally {
                if (content) {
                    setInfo(content);
                    cacheContent(content);
                }
                setIsLoading(false);
            }
        }
        fetchContent();
    }, [tmdbID, verticalPoster, horizontalPoster]);

    const renderTabContent = () => {
        switch (activeTab) {
        case 'About':
            return (
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.text}>{info && info?.content?.overview}</Text>

                <Text style={[styles.sectionTitle, {marginBottom: 0} ]}>Where to Stream</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: 10, paddingBottom: 10}}>
                    {info && info?.content?.streamingOptions.filter(s => !s.price).map((streamingOption, index) => (
                        <Pressable
                            key={index+streamingOption.deepLink}
                            style={styles.streamingLogo}
                            onPress={() => {
                                if (streamingOption.deepLink) {
                                    Linking.openURL(streamingOption.deepLink).catch(err => console.warn("Failed to open URL:", err));
                                } else {
                                    console.log("No link available");
                                }
                            }}
                        >
                            <SvgUri
                                uri={streamingOption.streamingService.darkLogo}
                                width={screenWidth / 5}
                                height={screenWidth / 5}
                            />
                        </Pressable>
                    ))}
                     {info && info?.content?.streamingOptions.filter(s => s.price).map((streamingOption, index) => (
                        <Pressable
                            key={index+streamingOption.deepLink}
                            style={styles.streamingLogo}
                            onPress={() => {
                                if (streamingOption.deepLink) {
                                    Linking.openURL(streamingOption.deepLink).catch(err => console.warn("Failed to open URL:", err));
                                } else {
                                    console.log("No link available");
                                }
                            }}
                        >
                            <SvgUri
                                uri={streamingOption.streamingService.darkLogo}
                                width={screenWidth / 5}
                                height={screenWidth / 5}
                            />
                            <Text style={{color: Colors.reviewTextColor, fontSize: 12, marginTop: -10, paddingBottom: 10}}>{getServicePrice(streamingOption)}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Genres</Text>
                <Text style={styles.text}>{
                    info && info?.content?.genres.map((genre) => (
                        genre.name
                    )).join(' | ')}
                </Text>

                <Text style={styles.sectionTitle}>Cast</Text>
                <Text style={styles.text}>
                {info && info?.content?.cast.join(' | ')}
                </Text>
            </View>
            );
        case 'Recommended':
            return (
            <View style={styles.content}>
                <Text style={[styles.sectionTitle, {paddingBottom: 10}]}>Explore similar content</Text>
                <FlatList<ContentPartialData>
                    data={info?.recommendations}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.tmdbID}
                    contentContainerStyle={styles.railListContent}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => handlePress(item)}
                            onLongPress={() => handleLongPress(item)}
                            android_ripple={{ color: Colors.grayCell }}
                        >
                            <View style={[styles.imageWrapper]}>
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
            );
        default:
            break;
        }
    };

    return (
        <View style={styles.screen}>
            <AlertMessage
                type={alertType}
                message={alertMessage}
                setMessage={setAlertMessage}
            />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.selectedTextColor} // iOS spinner color
                        colors={[Colors.selectedTextColor]} // Android spinner color
                    />
                }
            >
                <View style={styles.movieContainer}>
                    {/* Movie Poster */}
                    <View style={styles.posterContainer}>
                        <Image source={getPoster(info?.content)} style={[styles.posterImage]} />
                    </View>
                    
                    {/* Movie Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.title}>{info?.content?.title}</Text>
                        <View style={styles.attributeContainer}>
                            <Text style={[styles.text, {fontSize: 18, textAlignVertical: "center"}]}>
                                {(info?.content?.releaseYear > 0 ? info?.content?.releaseYear+ "    " 
                                        : (info?.content?.releaseYear > 0 
                                        ? info.content?.releaseYear+ "    " : "")) + getRuntime(info?.content)}
                            </Text>
                        </View>

                        <StarRating rating={info?.content?.rating} size={22} />

                        <View style={[styles.attributeContainer, {marginTop: 18}]} >
                            <Pressable
                                style={[appStyles.button, (lists.length > 1) ? {width: 140} : {width: undefined, paddingHorizontal: 10}]}
                                onPress={() => (lists.length > 1) ? setListModalVisible(true) : setCreateListModalVisible(true)}
                                disabled={!info || !info.content}
                            >
                                <Text style={[appStyles.buttonText, {fontSize: 16}]}>
                                    {(lists.length > 1) ? "Add to List" : "Create & Add to List"}
                                </Text>
                            </Pressable>
                            
                            <Heart
                                isSelected={() => isItemInList(lists, FAVORITE_TAB, tmdbID ? tmdbID : info ? info?.content?.tmdbID : "")}
                                size={35}
                                onPress={async () => await moveItemToList(info?.content, FAVORITE_TAB, lists, setLists, setIsLoading, setListModalVisible)}
                                disabled={!info || !info.content}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    {['About', 'Recommended'].map((tab) => (
                        <Pressable
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab)}
                        >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                        </Pressable>
                    ))}
                </View>

                {renderTabContent()}
            </ScrollView>

            {/* Lists */}
            <MoveModal
                selectedContent={info?.content}
                lists={lists}

                showLabel={false}
                showHeart={false}
                visibility={listModalVisible}
                
                setVisibilityFunc={setListModalVisible}
                setIsLoadingFunc={setIsLoading}

                moveItemFunc={moveItemToList}
                isItemInListFunc={isItemInList}

                setListsFunc={setLists}

                setAlertMessageFunc={setAlertMessage}
                setAlertTypeFunc={setAlertType}
            />
            <MoveModal
                selectedContent={selectedRecommendation}
                lists={lists}

                showLabel={false}
                showHeart={false}
                visibility={recommendedListModalVisible}

                setVisibilityFunc={setRecommendedListModalVisible}
                setIsLoadingFunc={setIsLoading}

                moveItemFunc={moveItemToList}
                isItemInListFunc={isItemInList}

                setListsFunc={setLists}

                setAlertMessageFunc={setAlertMessage}
                setAlertTypeFunc={setAlertType}
            />

            {/* Create List Modal */}
            <CreateNewListModal
                visible={createListModalVisible}
                setVisibilityFunc={setCreateListModalVisible}
                setIsLoadingFunc={setIsLoading}

                listName={newListName}
                setListNameFunc={setNewListName}
                lists={lists}
                setListsFunc={setLists}

                onCreateNewTabFunc={handleCreateNewTab}
                moveItemFunc={moveItemToList}
                selectedContent={info?.content}

                onRequestCloseFunc={() => setCreateListModalVisible(false)}
                
                setAlertMessageFunc={setAlertMessage}
                setAlertTypeFunc={setAlertType}
            />

            {/* Overlay */}
            {isLoading && (
                <View style={appStyles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 16, 
        backgroundColor: Colors.backgroundColor,
    },
    movieContainer: {
        paddingVertical: "4%",
        borderRadius: 10,
        marginVertical: "5%",
        alignItems: "center",
    },
    attributeContainer: {
        flexDirection: 'row', 
        columnGap: 15, 
        alignItems: "center",
    },

    posterContainer: { 
        aspectRatio: 17/24,
        height: 300,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.grayCell,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...appStyles.shadow,
    },
    posterImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    infoSection: {
      alignItems: "center", // Centers text under the poster
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        fontFamily: RalewayFont,
        paddingBottom: 10,
        ...appStyles.shadow
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      columnGap: 10,
      borderRadius: 10,
    },
    tab: {
      padding: 12,
      alignItems: 'center',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: Colors.selectedColor,
    },
    activeTab: {
      backgroundColor: Colors.selectedColor,
    },
    tabText: {
      color: Colors.reviewTextColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    streamingLogo: {
        maxWidth: screenWidth / 5,
        maxHeight: 50,
        margin: 5,
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
      padding: 16,
      marginBottom: 100,
      backgroundColor: Colors.selectedColor,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      minHeight: 150
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 8,
      color: 'white',
    },
    text: {
      fontSize: 14,
      color: Colors.reviewTextColor,
      marginVertical: 4,
      paddingBottom: 10,
    },

    railListContent: {
        paddingHorizontal: 4,
    },
    card: {
        width: screenWidth * 0.22,
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
    cardPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.96,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 17/24,
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
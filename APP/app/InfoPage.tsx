import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, TouchableOpacity, Dimensions, Pressable, Modal, FlatList, Linking, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import { appStyles, RalewayFont } from '@/styles/appStyles';
import { router } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import { TMDB_MEDIA_TYPE } from './types/tmdbType';
import { RapidAPIGetByTMDBID } from './helpers/contentAPIHelper';
import { ContentData, ContentPartialData, ListData, ListMinimalData, StreamingOptionData, StreamingServiceData } from './types/dataTypes';
import { useUserDataStore } from './stores/userDataStore';
import { FAVORITE_TAB, isItemInListMinimal, moveItemToListWithFuncs } from './helpers/StreamTrack/listHelper';
import { MoveModal } from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';
import { API } from './types/APIType';
import { getContentDetails } from './helpers/StreamTrack/contentHelper';
import { auth } from '@/firebaseConfig';
import { getRecentContent, useContentDataStore } from './stores/contentDataStore';

const screenWidth = Dimensions.get("window").width;

interface InfoPageParams {
    tmdbID?: string;
    title?: string;
    overview?: string;
    rating?: number;
    releaseYear?: number;
    verticalPoster?: string;
    horizontalPoster?: string;
}

export default function InfoPage() {

    const { tmdbID, title, overview, rating, releaseYear, verticalPoster, horizontalPoster } = useLocalSearchParams() as InfoPageParams;

    const { userData } = useUserDataStore();
    const { recentContent, addRecentContent } = useContentDataStore();

    const [lists, setLists] = useState<ListMinimalData[] | null>([...userData.user.listsOwned, ...userData.user.listsSharedWithMe]);

    const [content, setContent] = useState<ContentData | null>();

    const [isLoading, setIsLoading] = useState(true);
    
    const [listModalVisible, setListModalVisible] = useState(false);

    const [activeTab, setActiveTab] = useState<string>('About');
 
//    const [recommendedContent, setRecommendedContent] = useState<PosterContent[]>([]);
//    const [selectedRecommendation, setSelectedRecommendation] = useState<PosterContent | null>(null);
    const [infoModalVisible, setInfoModalVisible] = useState(false);

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

    useEffect(() => {
        const fetchContent = async () => {
            if (!tmdbID) return;

            const token = await auth.currentUser.getIdToken();

            let content: ContentData | null = getRecentContent(tmdbID);
            if (!content) {

                content = await getContentDetails(token, { tmdbID, title, overview, rating, releaseYear, verticalPoster, horizontalPoster } as ContentPartialData)

                if (content) {
                    addRecentContent(content);
                }
            }

            if (content) {
                setContent(content);
                setIsLoading(false);
            }
            
        }

        fetchContent();
    }, [tmdbID, title, overview, rating, releaseYear, verticalPoster, horizontalPoster]);

    const renderTabContent = () => {
        switch (activeTab) {
        case 'About':
            return (
            <View style={styles.content}>
                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Text style={styles.sectionTitle}>Rating  </Text>
                    {content && <StarRating rating={rating}/> }
                </View>

                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                <Text style={styles.sectionTitle}>{!content ? tmdbID.split('/')[0] === TMDB_MEDIA_TYPE.MOVIE ? "Movie" : "Series" : (
                    `${content.showType.charAt(0).toUpperCase() + content.showType.slice(1).toLowerCase()}`
                    )}</Text>
                <Text style={[styles.text, {fontSize: 18, paddingLeft: 15, paddingTop: 10, textAlign: 'left', textAlignVertical: "center"}]}>
                    {getRuntime(content)}
                </Text>
                </View>

                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.text}>{content && content.overview}</Text>

                <Text style={[styles.sectionTitle, {marginBottom: 0} ]}>Where to Watch</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: 10, paddingBottom: 10}}>
                    {content && content.streamingOptions.filter(s => !s.price).map((streamingOption, index) => (
                        <Pressable
                            key={index+streamingOption.deepLink}
                            style={{
                                maxWidth: screenWidth / 5,
                                maxHeight: 50,
                                margin: 5,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                if (streamingOption.deepLink) {
                                    Linking.openURL(streamingOption.deepLink).catch(err => console.error("Failed to open URL:", err));
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
                     {content && content.streamingOptions.filter(s => s.price).map((streamingOption, index) => (
                        <Pressable
                            key={index+streamingOption.deepLink}
                            style={{
                                maxWidth: screenWidth / 5,
                                maxHeight: 50,
                                margin: 5,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                if (streamingOption.deepLink) {
                                    Linking.openURL(streamingOption.deepLink).catch(err => console.error("Failed to open URL:", err));
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
                    content && content.genres.map((genre) => (
                        genre.name
                    )).join(' | ')}
                </Text>

                <Text style={styles.sectionTitle}>Cast</Text>
                <Text style={styles.text}>
                {content && content.cast.join(' | ')}
                </Text>
            </View>
            );
        case 'Recommended':
            return (
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Recommended</Text>
                <Text style={styles.text}>Explore more movies like this!</Text>
                {/* <FlatList
                    data={recommendedContent}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                        style={appStyles.movieCard}
                        onPress={() => router.push({
                                            pathname: '/InfoPage',
                                            params: { id: item.id },
                                            })}
                        onLongPress={() => {setSelectedRecommendation(item); setInfoModalVisible(true);}}
                        >
                        <Image
                            source={{uri: item && item.posters.vertical }}
                            style={appStyles.movieImage}
                        />
                        <Text style={appStyles.movieTitle}>{item.title}</Text>
                        </Pressable>
                    )}
                /> */}
            </View>
            );
        default:
            break;
        }
    };

    return (
        <View style={styles.screen}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.movieContainer}>
                {/* Movie Poster */}
                <Image source={{ uri: content && content.verticalPoster }} style={styles.posterImage} />
                {/* Movie Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{title ? title : (content && content.title)}</Text>
                    <View style={styles.attributeContainer}>
                        <Text style={[styles.text, {fontSize: 18, textAlignVertical: "center"}]}>
                            {(releaseYear && releaseYear > 0 ? releaseYear+ "    " 
                                    : (content && content.releaseYear > 0 
                                    ? content.releaseYear+ "    " : "")) + getRuntime(content)}
                        </Text>
                    </View>
                    <View style={[styles.attributeContainer, {marginTop: 5}]} >
                        <TouchableOpacity
                            style={appStyles.button}
                            onPress={() => setListModalVisible(true)}
                        >
                            <Text style={[appStyles.buttonText, {fontSize: 16}]}>Save to List</Text>
                        </TouchableOpacity>
                        
                        <Heart 
                            heartColor={isItemInListMinimal(lists, FAVORITE_TAB, tmdbID ? tmdbID : content ? content.tmdbID : "") ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                            size={45}
                            onPress={async () => await moveItemToListWithFuncs(content, FAVORITE_TAB, lists, setLists, setIsLoading, setListModalVisible)}
                        />
                    </View>
                </View>
                </View>

                <View style={styles.tabContainer}>
                    {['About', 'Recommended'].map((tab) => (
                        <TouchableOpacity
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
                        </TouchableOpacity>
                    ))}
                </View>

                {renderTabContent()}
            </ScrollView>

            {/* Lists */}
            <MoveModal
                selectedContent={content}
                lists={lists}
                showLabel={false}
                showHeart={false}
                visibility={listModalVisible}
                setVisibilityFunc={setListModalVisible}
                setIsLoadingFunc={setIsLoading}
                moveItemFunc={moveItemToListWithFuncs}
                isItemInListFunc={isItemInListMinimal}
                setListsFunc={setLists}
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
        borderRadius: 15,
        marginVertical: "5%",
        alignItems: "center",
    },
    attributeContainer: {
        flexDirection: 'row', 
        columnGap: 15, 
        alignItems: "center",
    },
    posterImage: {
      width: 200,
      height: 300,
      borderRadius: 10,
      marginBottom: 16,
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
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      columnGap: 10,
      borderRadius: 8,
    },
    tab: {
      padding: 12,
      alignItems: 'center',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
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
});
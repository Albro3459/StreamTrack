import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, TouchableOpacity, Dimensions, Pressable, Modal, FlatList, TextInput, Linking, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import { appStyles, RalewayFont } from '@/styles/appStyles';
import { router } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import { MEDIA_TYPE } from './types/tmdbType';
import { RapidAPIGetByTMDBID } from './helpers/contentAPIHelper';
import { ContentData, ListData, StreamingOptionData, StreamingServiceData } from './types/dataTypes';
import { useUserDataStore } from './stores/userDataStore';
import { FAVORITE_TAB, isItemInList, moveItemToListWithFuncs } from './helpers/StreamTrack/listHelper';
import { MOVE_MODAL_DATA_ENUM, MoveModal } from './components/moveModalComponent';
import { StarRating } from './components/starRatingComponent';

const screenWidth = Dimensions.get("window").width;

interface InfoPageParams {
    tmdbID?: string;
    title?: string;
    year?: string;
    media_type?: MEDIA_TYPE;
    verticalPoster?: string;
    horizontalPoster?: string;

    listName?: string;
    contentID?: string;
}

export default function InfoPage() {

    const { tmdbID, title, year, media_type, verticalPoster, horizontalPoster, listName, contentID } = useLocalSearchParams() as InfoPageParams;

    const { userData } = useUserDataStore();

    const [lists, setLists] = useState<ListData[] | null>([...userData.listsOwned, ...userData.listsSharedWithMe]);

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
                    (media_type === MEDIA_TYPE.MOVIE ? "0h 0m" : "Seasons: 5  |  Episodes: 10") 
                    : (
                        content.showType === 'movie' ? (
                        content.runtime ? toHoursAndMinutes(content.runtime) : ""
                    ) : (
                        content.seasonCount && content.episodeCount ? `Seasons: ${content.seasonCount}  |  Episodes: ${content.episodeCount}` : ""
                )));
    };

    useEffect(() => {
        const fetchContent = async () => {
            const lists: ListData[] = [...userData.listsOwned, ...userData.listsSharedWithMe];
            let content: ContentData;
            if (!listName || !contentID) {
                const allContents = lists.flatMap(l => l.contents);
                content = allContents.find(c => c.tmdb_ID === (media_type+"/"+tmdbID));
                if (!content) {
                    content = await RapidAPIGetByTMDBID(tmdbID ?? "", media_type ?? MEDIA_TYPE.MOVIE, verticalPoster ?? "", horizontalPoster ?? "");
                }
            } else {
                content = lists.find(l => l.listName === listName).contents.find(c => c.contentID === contentID);
            }

            if (content) {
                setContent(content);
                setIsLoading(false);
            }
            
        }

        fetchContent();
    }, [tmdbID, media_type, verticalPoster, horizontalPoster]);

    const renderTabContent = () => {
        switch (activeTab) {
        case 'About':
            return (
            <View style={styles.content}>
                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Text style={styles.sectionTitle}>Rating  </Text>
                    {content && <StarRating rating={parseFloat((content.rating / 20).toFixed(2))}/> }
                </View>

                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                <Text style={styles.sectionTitle}>{!content ? media_type === MEDIA_TYPE.MOVIE ? "Movie" : "Series" : (
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
                            {(year ? year : (content ? content.releaseYear : "1999")) + "    " + getRuntime(content)}
                        </Text>
                    </View>
                    <View style={[styles.attributeContainer, {marginTop: 5}]} >
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setListModalVisible(true)}
                        >
                            <Text style={styles.buttonText}>Save to List</Text>
                        </TouchableOpacity>
                        
                        <Heart 
                            heartColor={isItemInList(lists, FAVORITE_TAB, contentID ? contentID : content ? content.contentID : "") ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
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
                dataType={MOVE_MODAL_DATA_ENUM.CONTENT_DATA}
                selectedItem={content}
                lists={lists}
                showLabel={false}
                showHeart={false}
                visibility={listModalVisible}
                setVisibilityFunc={setListModalVisible}
                setIsLoadingFunc={setIsLoading}
                moveItemFunc={moveItemToListWithFuncs}
                isItemInListFunc={isItemInList}
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
    rating: {
      fontSize: 16,
      color: Colors.reviewTextColor,
      marginTop: 4,
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
    castContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    button: {
      backgroundColor: Colors.selectedColor,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: 150,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: Colors.altBackgroundColor,
      borderRadius: 10,
      padding: 20,
      width: screenWidth*0.8,
      alignItems: "center",
      ...appStyles.shadow
    },
    optionPressable: {
      backgroundColor: Colors.selectedColor,
      width: "90%",
      borderRadius: 10,
      margin: 5
    },
    selectedOptionPressable: {
      backgroundColor: Colors.selectedColor,
    },
    optionText: {
      fontSize: 16,
      color: "white",
      paddingVertical: 10,
      textAlign: "center",
      width: "100%",
    },
    textInput: {
      backgroundColor: '#333',
      color: '#fff',
      padding: 10,
      borderRadius: 8,
      marginBottom: 20,
      width: "100%",
      minHeight: 50,
    },
    ratingLabel: {
      color: '#fff',
      fontSize: 16,
      marginBottom: 10,
    },
    ratingInput: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    ratingStar: {
      fontSize: 30,
      marginHorizontal: 5,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff', // Adjust this to match your color scheme
      marginBottom: 15,
      textAlign: 'center',
    },
});
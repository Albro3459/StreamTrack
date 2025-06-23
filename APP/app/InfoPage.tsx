import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, TouchableOpacity, Dimensions, Pressable, Modal, FlatList, Alert, TextInput, Linking, ActivityIndicator } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
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
import { FAVORITE_TAB, isItemInList, moveItemToList } from './helpers/StreamTrack/listHelper';
import { MOVE_MODAL_DATA_ENUM, MoveModal } from './components/moveModalComponent';

const screenWidth = Dimensions.get("window").width;

// const REVIEW_STORAGE_KEY = 'movie_reviews';

interface InfoPageParams {
  id?: string;
  media_type?: MEDIA_TYPE;
  vertical?: string;
  horizontal?: string;

  listName?: string;
  contentID?: string;
}

export default function InfoPage() {

    const { id, media_type, vertical, horizontal, listName, contentID } = useLocalSearchParams() as InfoPageParams;

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
            if (!listName || !contentID) {
                const contentData: ContentData = await RapidAPIGetByTMDBID(id ?? "", media_type ?? MEDIA_TYPE.MOVIE, vertical ?? "", horizontal ?? "");
                setContent(contentData);
                setIsLoading(false);
            } else {
                const lists: ListData[] = [...userData.listsOwned, ...userData.listsSharedWithMe];
                const content: ContentData = lists.find(l => l.listName === listName).contents.find(c => c.contentID === contentID);
                setContent(content);
                setIsLoading(false);
            }
            
        }

        fetchContent();
    }, [id, media_type, vertical, horizontal]);

    const renderTabContent = () => {
        switch (activeTab) {
        case 'About':
            return (
            <View style={styles.content}>
                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Text style={styles.sectionTitle}>Rating  </Text>
                    {Array.from({ length: 5 }).map((_, index) => {
                        const rating = !content ? 0 : parseFloat((content.rating / 20).toFixed(2)); // Calculate the rating on a 5-star scale
                        const isFullStar = index < Math.floor(rating); // Full star if index is less than integer part of rating
                        const isHalfStar = index >= Math.floor(rating) && index < rating; // Half star if index is fractional

                        return (
                        <MaterialIcons
                            key={index}
                            name={isFullStar ? 'star' : isHalfStar ? 'star-half' : 'star-border'}
                            size={16}
                            color="#FFD700"
                        />
                        );
                    })}
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
                    {content && content.streamingOptions.filter(s => !s.price).map(streamingOption => (
                        <Pressable
                            key={JSON.stringify(streamingOption)}
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
                                uri={streamingOption.streamingService.logo}
                                width={screenWidth / 5}
                                height={screenWidth / 5}
                            />
                        </Pressable>
                    ))}
                     {content && content.streamingOptions.filter(s => s.price).map(streamingOption => (
                        <Pressable
                            key={JSON.stringify(streamingOption)}
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
                                uri={streamingOption.streamingService.logo}
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
        <View style={styles.screen} >
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.movieContainer}>
            {/* Movie Poster */}
            <Image source={{ uri: content && content.verticalPoster }} style={styles.posterImage} />
            {/* Movie Info */}
            <View style={styles.infoSection}>
                <Text style={styles.title}>{content && content.title}</Text>
                <View style={styles.attributeContainer}>
                    <Text style={[styles.text, {fontSize: 18, margin: 0, textAlignVertical: "center"}]}>
                        {(content ? content.releaseYear : "1999") + "    " + getRuntime(content)}
                    </Text>
                </View>
                <View style={styles.attributeContainer} >
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setListModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Add to List</Text>
                </TouchableOpacity>

                {/* Lists */}
                <MoveModal
                    dataType={MOVE_MODAL_DATA_ENUM.CONTENT_DATA}
                    selectedItem={content}
                    lists={lists}
                    showHeart={false}
                    visibility={listModalVisible}
                    setVisibilityFunc={setListModalVisible}
                    setIsLoadingFunc={setIsLoading}
                    moveItemFunc={moveItemToList}
                    isItemInListFunc={isItemInList}
                    setListsFunc={setLists}
                />
                <Heart 
                    heartColor={isItemInList(lists, FAVORITE_TAB, contentID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor}
                    size={45}
                    onPress={async () => await moveItemToList(content, FAVORITE_TAB, lists, setLists, setIsLoading, setListModalVisible)}
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

        {/* Move Modal */}
        {/* {selectedRecommendation && (
            <Modal
            transparent={true}
            visible={infoModalVisible}
            animationType="fade"
            onRequestClose={() => setInfoModalVisible(false)}
            >
            <Pressable
                style={appStyles.modalOverlay}
                onPress={() => setInfoModalVisible(false)}
            >
                <View style={appStyles.modalContent}>
                <Text style={appStyles.modalTitle}>
                    Move "{selectedRecommendation?.title}" to:
                </Text>
                {selectedRecommendation && (
                    <>
                    Render all tabs except FAVORITE_TAB
                    {Object.keys(lists)
                        .filter((tab) => tab !== FAVORITE_TAB)
                        .map((tab, index) => (
                        <TouchableOpacity
                            key={`LandingPage-${selectedRecommendation.id}-${tab}-${index}`}
                            style={[
                            appStyles.modalButton,
                            isItemInList(selectedRecommendation, tab, lists) && appStyles.selectedModalButton,
                            ]}
                            onPress={async () => await moveItemToTab(selectedRecommendation, tab, setLists, setPosterLists, [setInfoModalVisible], null)}
                        >
                            <Text style={appStyles.modalButtonText}>
                            {tab} {isItemInList(selectedRecommendation, tab, lists) ? "✓" : ""}
                            </Text>
                        </TouchableOpacity>
                        ))}

                    Render FAVORITE_TAB at the bottom
                    {lists[FAVORITE_TAB] && (
                        <View
                        key={`LandingPage-${selectedRecommendation.id}-heart`}
                        style={{ paddingTop: 10 }}
                        >
                        <Heart
                            heartColor={
                            heartColors[selectedRecommendation?.id] || Colors.unselectedHeartColor
                            }
                            size={35}
                            onPress={async () => await moveItemToTab(selectedRecommendation, FAVORITE_TAB, setLists, setPosterLists, [setInfoModalVisible], setHeartColors)}
                        />
                        </View>
                    )}
                    </>
                )}
                </View>
            </Pressable>
            </Modal>
        )} */}

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
      // backgroundColor: "white",
      paddingVertical: "4%",
      borderRadius: 15,
      marginVertical: "5%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // For Android shadow
    },
    attributeContainer: {
      flexDirection: 'row', 
      columnGap: 15, 
      alignContent: "center",
      alignItems: "center"
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
      marginTop: 16,
    },
    tab: {
      padding: 12,
      alignItems: 'center',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: Colors.unselectedColor,
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
      backgroundColor: Colors.buttonColor,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: 10,
      width: 200,
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
      backgroundColor: Colors.cardBackgroundColor,
      borderRadius: 10,
      padding: 20,
      width: screenWidth*0.8,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    optionPressable: {
      backgroundColor: Colors.unselectedColor,
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
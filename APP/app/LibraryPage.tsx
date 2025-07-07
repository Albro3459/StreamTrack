"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from 'expo-router';
import Heart from './components/heartComponent';
import { appStyles } from '@/styles/appStyles';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserData, useUserDataStore } from './stores/userDataStore';
import { ContentPartialData, ListMinimalData } from './types/dataTypes';
import { FAVORITE_TAB, getContentsInList, handleCreateNewTab, isItemInList, moveItemToList, sortLists } from './helpers/StreamTrack/listHelper';
import MoveModal from './components/moveModalComponent';
import CreateNewListModal from './components/createNewListComponent';
import AlertMessage, { Alert } from './components/alertMessageComponent';
import { useFocusEffect } from '@react-navigation/native';
import { getPoster } from './helpers/StreamTrack/contentHelper';
import { auth } from '@/firebaseConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Prevent splash screen from hiding until everything is loaded
SplashScreen.preventAutoHideAsync();

export default function LibraryPage() {
    const router = useRouter();
    const pagerViewRef = useRef(null); // Which tab is seleted
    const flatListRef = useRef<FlatList<string>>(null); // Scrolling the tab names to show current one

    const { userData } = useUserDataStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const [lists, setLists] = useState<ListMinimalData[] | null>(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));

    const [activeTab, setActiveTab] = useState<string | null>(FAVORITE_TAB);

    const [newListName, setNewListName] = useState<string>("");
    const [createListModalVisible, setCreateListModalVisible] = useState(false);

    const [selectedContent, setSelectedContent] = useState<ContentPartialData | null>(null);
    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchUserData(await auth.currentUser.getIdToken());
        } finally {
            setRefreshing(false);
        }
    };

    const setRefs = (index: number, length: number) => {
        index = index >= 0 ? index : 0;
        pagerViewRef.current?.setPage(index);
        flatListRef.current.scrollToIndex({ 
            index: index, animated: true, 
            viewPosition: index <= 1 ? 0 : index === length - 1 ? 1 : 0.5 // 0: start, 0.5: center, 1: end
        });
    }    

    const handleTabPress = (listName: string) => {
        setActiveTab(listName);
        pagerViewRef.current?.setPage(lists.map(l => l.listName).indexOf(listName));

        setLists(sortLists(lists));
    };

    useFocusEffect(
        useCallback(() => {
            if (userData) {
                setLists(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));
            }
        }, [userData])
    );

    useEffect(() => {
        if (lists && isLoading) {
            setIsLoading(false);
        }
    }, [lists, isLoading]);

    const renderTabContent = (contents: ContentPartialData[], list: string) => {
        if (!contents || contents.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center' }}>
                    Your list is empty. Start adding content!
                </Text>
            </View>
        );
        }
  
        return (
        <FlatList<ContentPartialData>
            data={userData?.contents && getContentsInList(userData.contents, lists, activeTab)}
            numColumns={3}
            keyExtractor={(content, index) => `${content.tmdbID}-${index}-${list}`}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.selectedTextColor} // iOS spinner color
                    colors={[Colors.selectedTextColor]} // Android spinner color
                />
            }
            renderItem={({ item: content }) => (
                <View style={styles.movieCard} >
                    <Pressable
                        style={({ pressed }) => [
                            // styles.movieCard,
                            pressed && appStyles.pressed,
                        ]}
                        onPress={() => {
                            router.push({
                                pathname: '/InfoPage',
                                params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, horizontalPoster: content.horizontalPoster },
                            });
                        }}
                        onLongPress={() => {
                            setSelectedContent(content);
                            setMoveModalVisible(true);
                        }}
                    >
                        <Image
                            source={getPoster(content)}
                            style={[styles.movieImage]}
                        />
                    </Pressable>
                    <Text style={styles.movieTitle}>{content.title}</Text>
                </View>
            )}
        />
        );
    };

    {/* Main Content */}
    return (
        <View style={styles.container}>
            <AlertMessage
                type={alertType}
                message={alertMessage}
                setMessage={setAlertMessage}
            />

            {/* Tab Bar */}
            <View style={[styles.tabBar, (lists && lists.length <= 4) && {paddingLeft: 24}]}>
                <FlatList<string>
                    data={lists.map(l => l.listName)}
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    keyExtractor={(listName, index) => listName}
                    renderItem={({ item: listName }) => (
                        <Pressable
                            style={[styles.tabItem, activeTab === listName && styles.activeTabItem, {paddingHorizontal:8}, (lists && lists.length <= 4) && {paddingHorizontal: 12}]}
                            onPress={async () => handleTabPress(listName)}
                        >
                        { listName === FAVORITE_TAB ? (
                            <Heart 
                                size={25}
                                onPress={async () => handleTabPress(listName)}
                            />
                        ) : (
                            <Text
                            style={[styles.tabText, activeTab === listName && styles.activeTabText]}
                            >
                            {listName}
                            </Text>
                        )}
                        </Pressable>
                    )}
                />
                <Pressable onPress={() => setCreateListModalVisible(true)} >
                        <Ionicons name="add" size={28} color="white" />
                </Pressable>
            </View>

            {/* Pager View */}
            <PagerView
                style={{ flex: 1, marginTop: 20, marginBottom: 50 }}
                initialPage={lists.map(l => l.listName).indexOf(activeTab) ?? 0}
                key={lists.map(l => l.listName).join('-')}
                ref={pagerViewRef}
                onPageSelected={(e) => setActiveTab(lists[e.nativeEvent.position].listName)}
            >
                {/* Renders all lists :(
                 {lists.map(l => ({listName: l.listName, contents: userData?.contents && getContentsInList(userData.contents, lists, l.listName)})).map((list) => (
                    <View style={{paddingHorizontal: 5}} key={list.listName}>{renderTabContent(list.contents, list.listName)}</View>
                ))} */}

                {lists.map((list, index) => {
                    const isActive = (i: number) => (i >= 0 && i === lists.findIndex(item => item.listName === activeTab));
                    // Only rendering neighboring tabs
                    if ((isActive(index) || isActive(index - 1) || isActive(index + 1)) && userData?.contents) {
                        const contents = getContentsInList(userData.contents, lists, list.listName);
                        return <View style={{paddingHorizontal: 5}} key={list.listName}>{renderTabContent(contents, list.listName)}</View>;
                    } else {
                        return <View style={{paddingHorizontal: 5}} key={list.listName} />;
                    }
                })}
            </PagerView>

            <MoveModal
                selectedContent={selectedContent}
                lists={lists}

                // showLabel={false}
                visibility={moveModalVisible}

                setVisibilityFunc={setMoveModalVisible}
                setIsLoadingFunc={setIsLoading}

                moveItemFunc={moveItemToList}
                isItemInListFunc={isItemInList}

                setListsFunc={setLists}

                setAlertMessageFunc={setAlertMessage}
                setAlertTypeFunc={setAlertType}

                setRefsFunc={setRefs}
                setActiveTabFunc={setActiveTab}
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
                setRefsFunc={setRefs}
                setActiveTabFunc={setActiveTab}

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
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
    },
    container: { flex: 1, backgroundColor: Colors.backgroundColor },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundColor,
        paddingVertical: 15,
        paddingLeft: 15,
        paddingRight: "3.5%",
        alignItems: "center"
    },
    tabItem: {
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTabItem: { 
        backgroundColor: Colors.altBackgroundColor,
        //  ...appStyles.shadow
    },
    tabText: { 
        color: Colors.reviewTextColor, 
        fontSize: 14,
        textAlign: "center",
    },
    activeTabText: { color: 'white', fontWeight: 'bold' },

    movieCard: { 
        flex: 1, 
        margin: 5, 
        alignItems: 'center', 
        paddingBottom: 10,
    },
    movieImage: { 
        aspectRatio: 17/24, 
        width: screenWidth * 0.22, 
        height: screenWidth * 0.33, 
        borderRadius: 10,
        ...appStyles.shadow,
    },
    movieTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 5,
        maxWidth: screenWidth * 0.33,
        ...appStyles.shadow,
    },
});
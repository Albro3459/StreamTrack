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
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter } from 'expo-router';
import Heart from './components/heartComponent';
import { appStyles } from '@/styles/appStyles';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserData, setUserData, useUserDataStore } from './stores/userDataStore';
import { ContentPartialData, ListMinimalData } from './types/dataTypes';
import { deleteUserList, FAVORITE_TAB, getContentsInList, handleCreateNewTab, isItemInList, moveItemToList, sortLists } from './helpers/StreamTrack/listHelper';
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
    const pagerViewRef = useRef<PagerView | null>(null); // Which tab is seleted
    const flatListRef = useRef<FlatList<string> | null>(null); // Scrolling the tab names to show current one
    const wiggleAnimations = useRef([]);

    const { userData } = useUserDataStore();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    const [lists, setLists] = useState<ListMinimalData[] | null>(sortLists([...userData?.user?.listsOwned || [], ...userData?.user?.listsSharedWithMe || []]));

    const [activeTab, setActiveTab] = useState<string | null>(FAVORITE_TAB);
    const [deleteTab, setDeleteTab] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const [newListName, setNewListName] = useState<string>("");
    const [createListModalVisible, setCreateListModalVisible] = useState(false);

    const [selectedContent, setSelectedContent] = useState<ContentPartialData | null>(null);
    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const startWiggle = (index) => {
        Animated?.loop(
            Animated?.sequence([
                Animated?.timing(wiggleAnimations.current[index], { toValue: 1, duration: 70, useNativeDriver: true }),
                Animated?.timing(wiggleAnimations.current[index], { toValue: 0, duration: 70, useNativeDriver: true }),
                Animated?.timing(wiggleAnimations.current[index], { toValue: -1, duration: 70, useNativeDriver: true }),
            ])
        )?.start();
    };

    const stopWiggle = (index) => {
        wiggleAnimations.current[index]?.stopAnimation();
        wiggleAnimations.current[index]?.setValue(0);
    };

    const getRandomNumber = (min: number = 0, max: number = 1000): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setAlertMessage("");
        setAlertType(Alert.Error);
        try {
            await fetchUserData(router, await auth.currentUser.getIdToken());
        } finally {
            setRefreshing(false);
        }
    };

    const setRefs = (index: number, length: number) => {
        index = index >= 0 ? index : 0;
        pagerViewRef?.current?.setPage(index);
        flatListRef?.current?.scrollToIndex({ 
            index: index, animated: true, 
            viewPosition: index <= 1 ? 0 : index === length - 1 ? 1 : 0.5 // 0: start, 0.5: center, 1: end
        });
    };

    const startDeleting = (lists: ListMinimalData[]) => {
        setDeleting(true);
        lists.forEach((l, index) => {
            if (index === lists.findIndex(l => l.listName === FAVORITE_TAB)) return;
            startWiggle(index);
        });
    };

    const doneDeleting = (lists: ListMinimalData[]) => {
        setDeleting(false); setDeleteTab(null);
        lists.forEach((l, index) => {
            stopWiggle(index);
        });
    };

    const handleTabDelete = async (listName: string) => {
        const normalized = listName.toLowerCase().trim();
        const success = await deleteUserList(router, await auth?.currentUser?.getIdToken(), normalized, setAlertMessage, setAlertType);
        if (success) {
            const newListsOwned: ListMinimalData[] = [...userData?.user?.listsOwned.filter(l => l.listName.toLowerCase().trim() !== normalized) || []];
            const newListsSharedWithMe: ListMinimalData[] = [...userData?.user?.listsSharedWithMe.filter(l => l.listName.toLowerCase().trim() !== normalized) || []];

            setUserData({
                ...userData,
                user: {
                    ...userData?.user,
                    listsOwned: newListsOwned,
                    listsSharedWithMe: newListsSharedWithMe
                }
            });

            setLists(sortLists([...newListsOwned, ...newListsSharedWithMe]));

            handleTabPress(FAVORITE_TAB);
        }
        doneDeleting(lists);
    };

    const handleTabPress = (listName: string) => {
        listName = listName.toLowerCase().trim();
        setActiveTab(listName);
        pagerViewRef?.current?.setPage(lists.map(l => l?.listName.toLowerCase()).indexOf(listName));

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
        if (lists) {
            if (isLoading) {
                setIsLoading(false);
            }

            while (wiggleAnimations?.current?.length < lists.length) {
                wiggleAnimations?.current?.push(new Animated.Value(0));
            }
            while (wiggleAnimations?.current?.length > lists.length) {
                wiggleAnimations?.current?.pop();
            }
        }
    }, [lists, isLoading, wiggleAnimations]);

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
                            pressed && appStyles.pressed,
                        ]}
                        onPress={() => {
                            router.push({
                                pathname: '/InfoPage',
                                params: { tmdbID: content.tmdbID, verticalPoster: content.verticalPoster, largeVerticalPoster: content.largeVerticalPoster, horizontalPoster: content.horizontalPoster },
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
                        <View style={appStyles.heartIconWrapper}>
                            <Heart
                                isSelected={() => isItemInList(lists, FAVORITE_TAB, content?.tmdbID)}
                                size={20}
                                background={true}
                                onPress={async () => await moveItemToList(router, content, FAVORITE_TAB, lists, setLists, setIsLoading, () => {}, () => {}, setAlertMessage, setAlertType)}
                            />
                        </View>
                    </Pressable>
                    <Text style={styles.movieTitle}>{content.title}</Text>
                </View>
            )}
        />
        );
    };

    {/* Main Content */}
    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: deleting ? () => (
                        <Pressable onPress={() => doneDeleting(lists)} style={{ marginRight: 16 }}>
                            <Text style={{ color: Colors.selectedTextColor, fontWeight: "bold" }}>Done</Text>
                        </Pressable>
                    ) : undefined, // undefined means show the back button. I know its fucking stupid
                    headerBackVisible: deleting ? false : true,
                }}
            />
            <View style={[styles.container]}>
                <AlertMessage
                    type={alertType}
                    message={alertMessage}
                    setMessage={setAlertMessage}
                />

                {/* Tab Bar */}
                <View style={{position: 'relative'}}>
                    {deleting && (
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            pointerEvents="auto"
                            onPress={() => doneDeleting(lists)}
                        />
                    )}
                    <View style={[styles.tabBar, (lists && lists.length <= 4) && {paddingLeft: 24}]}
                        pointerEvents={deleting ? "box-none" : "auto"}
                    >
                        <FlatList<string>
                            data={lists.map(l => l?.listName)}
                            ref={flatListRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled
                            keyExtractor={(listName, index) => listName+"-"+index+"-"+getRandomNumber()}
                            contentContainerStyle={{ alignItems: "center" }}
                            renderItem={({ item: listName, index }) => {
                                const wiggle = wiggleAnimations.current[index]?.interpolate({
                                    inputRange: [-1, 1],
                                    outputRange: ['-3deg', '3deg'],
                                });
                                
                                return (
                                    <Animated.View style={{ transform: [{ rotate: deleting ? wiggle : '0deg' }] }}>
                                        <>
                                            <Pressable
                                                style={[styles.tabItem, activeTab === listName && styles.activeTabItem, {paddingHorizontal:8}, (lists && lists.length <= 4) && {paddingHorizontal: 12}]}
                                                onPress={async () => deleting ? doneDeleting(lists) : handleTabPress(listName) /* do nothing if deleting */}
                                                onLongPress={() => lists.length > 1 && startDeleting(lists)}
                                            >
                                                { listName === FAVORITE_TAB ? (
                                                    <Heart 
                                                        size={25}
                                                        onPress={async () => deleting ? doneDeleting(lists) : handleTabPress(listName)}
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <Text
                                                        style={[styles.tabText, activeTab === listName && styles.activeTabText]}
                                                    >
                                                        {listName}
                                                    </Text>
                                                )}
                                            </Pressable>

                                            {deleting && listName !== FAVORITE_TAB && (
                                                <Pressable
                                                    onPress={() => setDeleteTab(listName)}
                                                    style={styles.deleteButton}
                                                >
                                                    <Ionicons name="close" size={14} color="white" />
                                                </Pressable>
                                            )}
                                        </>
                                    </Animated.View>
                                );

                            }}
                        />
                        <Pressable onPress={() => deleting ? doneDeleting(lists) : setCreateListModalVisible(true)} >
                                <Ionicons name="add" size={28} color="white" />
                        </Pressable>
                    </View>
                </View>

                <View style={{flex: 1}}>
                    {/* Pager View */}
                    <PagerView
                        style={{ flex: 1, marginTop: 20, marginBottom: 50 }}
                        initialPage={lists.map(l => l?.listName.toLowerCase()).indexOf(activeTab.toLowerCase()) ?? 0}
                        key={lists.map(l => l?.listName+"-"+getRandomNumber()).join('-')}
                        ref={pagerViewRef}
                        onPageSelected={(e) => setActiveTab(lists[e.nativeEvent.position]?.listName)}
                    >
                        {/* Renders all lists :(
                        {lists.map(l => ({listName: l?.listName, contents: userData?.contents && getContentsInList(userData.contents, lists, l?.listName)})).map((list) => (
                            <View style={{paddingHorizontal: 5}} key={list?.listName}>{renderTabContent(list.contents, list?.listName)}</View>
                        ))} */}

                        {lists.map((list, index) => {
                            const isActive = (i: number) => (i >= 0 && i === lists.findIndex(item => item?.listName.toLowerCase() === activeTab.toLowerCase()));
                            // Only rendering neighboring tabs
                            if ((isActive(index) || isActive(index - 1) || isActive(index + 1)) && userData?.contents) {
                                const contents = getContentsInList(userData.contents, lists, list?.listName);
                                return <View style={{paddingHorizontal: 5}} key={list?.listName+"-"+(lists.map(l => l?.listName.toLowerCase()).indexOf(activeTab.toLowerCase()) ?? 0)+"-"+getRandomNumber()}>
                                        {renderTabContent(contents, list?.listName.toLowerCase())}
                                    </View>;
                            } else {
                                return <View style={{paddingHorizontal: 5}} key={list?.listName+"-"+(lists.map(l => l?.listName.toLowerCase()).indexOf(activeTab.toLowerCase()) ?? 0)+"-"+getRandomNumber()} />;
                            }
                        })}
                    </PagerView>

                    <MoveModal
                        router={router}
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
                        router={router}
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

                    {deleteTab && (
                        <Modal
                            transparent
                            visible={!!deleteTab}
                            animationType="none"
                            onRequestClose={() => doneDeleting(lists)}
                        >
                            <Pressable style={styles.modalOverlay} onPress={() => doneDeleting(lists)}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Delete List?</Text>
                                    <Text style={[appStyles.optionText, {marginTop: 10, marginBottom: 15, textAlign: "center", fontSize: 14}]}>
                                        Are you sure you want to delete
                                        {deleteTab ? ` "${deleteTab}"` : ""}?
                                        This cannot be undone.
                                    </Text>
                                    <View style={styles.buttonRow}>
                                        <Pressable style={styles.cancelButton} onPress={() => doneDeleting(lists)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </Pressable>
                                        <Pressable style={styles.button} onPress={async () => await handleTabDelete(deleteTab)}>
                                            <Text style={styles.buttonText}>Delete</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Pressable>
                        </Modal>
                    )}

                    {deleting && (
                        <Pressable
                            style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 10,
                            }}
                            onPress={() => doneDeleting(lists)}
                        />
                    )}
                </View>

                {/* Overlay */}
                {isLoading && (
                    <View style={appStyles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    deleteButton: {
        position: "absolute",
        top: -3,      // slightly above the tab
        right: -3,    // slightly outside the tab
        zIndex: 50,
        backgroundColor: "red",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        ...appStyles.shadow
},

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
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        overflow: "visible",
        zIndex: 0
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 20,
        width: '67%',
        alignItems: 'center',
        ...appStyles.shadow
    },
    modalTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textInput: {
        width: '100%',
        borderWidth: 1,
        backgroundColor: Colors.grayCell,
        borderColor: Colors.backgroundColor,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        color: Colors.backgroundColor,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        columnGap: 10
    },
    cancelButton: {
        ...appStyles.button,
        ...appStyles.secondaryButton,
        width: undefined,
        flex: 1
    },
    cancelButtonText: {
        ...appStyles.buttonText,
        ...appStyles.secondaryButtonText,
    },
    button: {
        ...appStyles.button,
        width: undefined,
        flex: 1
    },
    buttonText: {
        ...appStyles.buttonText,
    },
});
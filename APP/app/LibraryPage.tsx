import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as SplashScreen from "expo-splash-screen";
import { router, usePathname } from 'expo-router';
import Heart from './components/heartComponent';
import { appStyles } from '@/styles/appStyles';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { setUserData, useUserDataStore } from './stores/userDataStore';
import { ContentData, ListData } from './types/dataTypes';
import { addContentToUserList, createNewUserList, FAVORITE_TAB, isItemInList, moveItemToListWithFuncs, removeContentFromUserList, sortLists } from './helpers/StreamTrack/listHelper';
import { User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { MOVE_MODAL_DATA_ENUM, MoveModal } from './components/moveModalComponent';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Prevent splash screen from hiding until everything is loaded
SplashScreen.preventAutoHideAsync();

export default function LibraryPage() {
    const pagerViewRef = useRef(null);

    const { userData } = useUserDataStore();

    const [lists, setLists] = useState<ListData[] | null>(sortLists([...userData.listsOwned, ...userData.listsSharedWithMe]));

    const [activeTab, setActiveTab] = useState<string | null>(lists[0].listName);

    const [newListName, setNewListName] = useState<string>("");
    const [createNewListModal, setCreateNewListModal] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedContentData, setSelectedContentData] = useState<ContentData | null>(null);
    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const handelCreateNewTab = async (listName: string) => {
        if (listName.trim()) {
            const user: User | null = auth.currentUser;
            if (!user) {
                setIsLoading(false);
                setMoveModalVisible(false);
                return;
            }
            const token = await user.getIdToken();
            const newList: ListData = await createNewUserList(token, listName);
            setNewListName("");
            setCreateNewListModal(false);
            setLists(prev => sortLists([...prev, newList]));
            userData.listsOwned.push(newList);
            setUserData(userData);
            setActiveTab(listName);
            pagerViewRef.current?.setPage(lists.map(l => l.listName).indexOf(listName));
        }
    };

    const handleTabPress = (listName: string) => {
        setActiveTab(listName);
        pagerViewRef.current?.setPage(lists.map(l => l.listName).indexOf(listName));

        setLists(sortLists(lists));
    };

    useEffect(() => {
        if (lists && isLoading) {
            setIsLoading(false);
        }
    }, [lists, isLoading]);

    const renderTabContent = (contents: ContentData[], list: string) => {
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
        <FlatList<ContentData>
            data={lists.find(l => l.listName === activeTab).contents}
            numColumns={2}
            keyExtractor={(content, index) => `${content.contentID}-${index}-${list}`}
            renderItem={({ item: content }) => (
            <TouchableOpacity
                style={styles.movieCard}
                onPress={() => {
                    router.push({
                        pathname: '/InfoPage',
                        params: { listName: activeTab, contentID: content.contentID },
                    });
                }}
                onLongPress={() => {
                    setSelectedContentData(content);
                    setMoveModalVisible(true);
                }}
            >
                <Image
                source={{
                    uri: content.verticalPoster || 
                        (console.log(`Library poster missing for: ${content.title} | poster: ${content.verticalPoster}`), "")
                    }}
                style={styles.movieImage}
                />
                <Text style={styles.movieTitle}>{content.title}</Text>
            </TouchableOpacity>
            )}
        />
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
            {/* Tab Bar */}
            <View style={[styles.tabBar, {flexDirection: 'row'}, (lists && lists.length <= 4) && {paddingLeft: 24}]}>
                <FlatList<string>
                    data={lists.map(l => l.listName)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    keyExtractor={(listName, index) => listName}
                    renderItem={({ item: listName }) => (
                        <TouchableOpacity
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
                        </TouchableOpacity>
                    )}
                />
                <Pressable onPress={() => setCreateNewListModal(true)} >
                    <View style={{ paddingLeft: 10}}>
                        <Ionicons name="add-circle-outline" size={35} color="white" />
                    </View> 
                </Pressable>
            </View>
                
            {/* Create List Modal */}
            <Modal
                transparent={true}
                visible={createNewListModal}
                animationType="fade"
                onRequestClose={() => setCreateNewListModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setCreateNewListModal(false)}
                >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New List</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter list name"
                        value={newListName}
                        onChangeText={setNewListName}
                    />
                    <View style={styles.buttonRow}>
                    <Pressable
                        style={styles.cancelButton}
                        onPress={() => setCreateNewListModal(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        style={styles.addButton}
                        onPress={async () => await handelCreateNewTab(newListName) }
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                    </View>
                </View>
                </Pressable>
            </Modal>

            {/* Pager View */}
            <PagerView
                style={{ flex: 1, marginTop: 20, marginBottom: 50 }}
                initialPage={0}
                key={lists.map(l => l.listName).join('-')}
                ref={pagerViewRef}
                onPageSelected={(e) => setActiveTab(lists[e.nativeEvent.position].listName)}
            >
                {lists.map((list) => (
                <View key={list.listName}>{renderTabContent(list.contents, list.listName)}</View>
                ))}
            </PagerView>

            <MoveModal
                dataType={MOVE_MODAL_DATA_ENUM.CONTENT_DATA}
                selectedItem={selectedContentData}
                lists={lists}
                visibility={moveModalVisible}
                setVisibilityFunc={setMoveModalVisible}
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
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.tabBarColor,
        justifyContent: 'center',
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    tabItem: {
        minWidth: 10,
        minHeight: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTabItem: { backgroundColor: Colors.selectedTabColor },
    tabText: { 
        color: Colors.reviewTextColor, 
        fontSize: 14,
        textAlign: "center",
    },
    activeTabText: { color: 'white', fontWeight: 'bold' },
    movieCard: { flex: 1, margin: 5, alignItems: 'center', paddingBottom: 10 },
    movieImage: { aspectRatio: 11/16, minWidth: screenWidth/3.3, minHeight: screenWidth / 2.2,  borderRadius: 10 },
    movieTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 5,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.backgroundColor,
    },
    textInput: {
        width: '100%',
        borderWidth: 1,
        backgroundColor: `${Colors.unselectedColor}CC`, // Add 'CC' for 80% opacity in HEX
        borderColor: Colors.backgroundColor,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        padding: 10,
        backgroundColor: Colors.grayCell,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.backgroundColor,
    },
    addButton: {
        padding: 10,
        backgroundColor: Colors.buttonColor,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
    },
});
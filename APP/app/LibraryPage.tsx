import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Alert,
  Pressable,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from "expo-splash-screen";
import { router, usePathname } from 'expo-router';
import Heart from './components/heartComponent';
import { Content, PosterContent } from './types/contentType';
import { appStyles } from '@/styles/appStyles';
// import { Global, STORAGE_KEY } from '@/Global';
import { Colors } from '@/constants/Colors';
// import { PosterList, WatchList } from './types/listsType';
// import { createNewList, DEFAULT_TABS, FAVORITE_TAB, isItemInList, moveItemToTab, sortTabs, turnTabsIntoPosterTabs } from './helpers/listHelper';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { setUserData, useUserDataStore } from './stores/userDataStore';
import { ContentData, ListData, UserData } from './types/dataTypes';
import { addContentToUserList, isItemInList, removeContentFromUserList } from './helpers/StreamTrack/listHelper';
import { FetchCache } from './helpers/cacheHelper';
import { User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

const FAVORITE_TAB = "Favorites";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Prevent splash screen from hiding until everything is loaded
SplashScreen.preventAutoHideAsync();

export default function LibraryPage() {
    const pathname = usePathname();
    const pagerViewRef = useRef(null);

    const { userData } = useUserDataStore();

    const sortLists = (lists: ListData[]) => {
        return [...lists].sort((a, b) => {
            if (a.listName === FAVORITE_TAB) return -1;
            if (b.listName === FAVORITE_TAB) return 1;
            return 0;
        });
    };

    const [lists, setLists] = useState<ListData[] | null>(sortLists([...userData.listsOwned, ...userData.listsSharedWithMe]));

    const [activeTab, setActiveTab] = useState<string | null>(lists[0].listName);

    const [newListName, setNewListName] = useState<string>("");
    const [createNewListModal, setCreateNewListModal] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState<ContentData | null>(null);
    const [moveModalVisible, setMoveModalVisible] = useState(false);

//   const handelCreateNewTab = async (newTabName: string) => {
//     if (newTabName.trim()) {
//       const newTabIndex: number = Object.keys(tabs).length;
//       await createNewList(newListName, setTabs, setPosterTabs);
//       setNewListName("");
//       setCreateNewListModal(false);
//       setActiveTab(newTabIndex);
//       pagerViewRef.current?.setPage(newTabIndex);
//     }
//   };

    const moveItemToTab = async (content: ContentData, listName: string, lists: ListData[]) => {
        // Only works for user owned lists for now
        setIsLoading(true);
        let list: ListData = lists.find(l => l.listName === listName);
        if (!list) {
            setIsLoading(false);
            setMoveModalVisible(false);
            return;
        }
        const user: User | null = auth.currentUser;
        if (!user) {
            setIsLoading(false);
            setMoveModalVisible(false);
            return;
        }
        const token = await user.getIdToken();
        list = list.contents.some(c => c.contentID === content.contentID) ? 
                await removeContentFromUserList(token, list.listName, content.contentID)
                :
                await addContentToUserList(token, list.listName, content);
        if (list) {
            userData.listsOwned = userData.listsOwned.filter(l => l.listName !== list.listName);
            userData.listsOwned.push(list);
            setLists(sortLists([...userData.listsOwned, ...userData.listsSharedWithMe]));
            setUserData(userData);
        }
        setIsLoading(false);
        setMoveModalVisible(false);
    }

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
                Your list is empty. Start adding items!
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
                setSelectedContent(content);
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
                // onPress={async () => await handelCreateNewTab(newListName) }
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

      {/* Move Modal */}
      {selectedContent && (
        <Modal
          transparent={true}
          visible={moveModalVisible}
          animationType="fade"
          onRequestClose={() => setMoveModalVisible(false)}
        >
          <Pressable
            style={appStyles.modalOverlay}
            onPress={() => setMoveModalVisible(false)}
          >
            <View style={appStyles.modalContent}>
              <Text style={appStyles.modalTitle}>
                Move "{selectedContent?.title}" to:
              </Text>
              {selectedContent && (
                <>
                  {/* Render all tabs except FAVORITE_TAB */}
                  {lists
                    .filter((list) => list.listName !== FAVORITE_TAB)
                    .map((list, index) => (
                      <TouchableOpacity
                        key={`LandingPage-${selectedContent.contentID}-${list.listName}-${index}`}
                        style={[
                          appStyles.modalButton,
                          isItemInList(lists, list.listName, selectedContent.contentID) && appStyles.selectedModalButton,
                        ]}
                        onPress={async () => await moveItemToTab(selectedContent, list.listName, lists)}
                      >
                        <Text style={appStyles.modalButtonText}>
                          {list.listName} {isItemInList(lists, list.listName, selectedContent.contentID) ? "✓" : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}

                  {/* Render FAVORITE_TAB at the bottom */}
                  {lists.find(l => l.listName === FAVORITE_TAB) && (
                    <View
                      key={`LandingPage-${selectedContent.contentID}-heart`}
                      style={{ paddingTop: 10 }}
                    >
                      <Heart
                        heartColor={
                          isItemInList(lists, FAVORITE_TAB, selectedContent.contentID) ? Colors.selectedHeartColor : Colors.unselectedHeartColor
                        }
                        size={35}
                        onPress={async () => await moveItemToTab(selectedContent, FAVORITE_TAB, lists)}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </Pressable>
        </Modal>
      )}

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
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  tabItem: {
    minWidth: 10,
    minHeight: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  activeTabItem: { backgroundColor: Colors.selectedTabColor },
  tabText: { color: Colors.reviewTextColor, fontSize: 14 },
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
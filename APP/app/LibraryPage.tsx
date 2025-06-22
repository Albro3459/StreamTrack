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
import { useUserDataStore } from './stores/userDataStore';
import { ContentData, ListData } from './types/dataTypes';

const FAVORITE_TAB = "Favorites";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Prevent splash screen from hiding until everything is loaded
SplashScreen.preventAutoHideAsync();

export default function LibraryPage() {
  const pathname = usePathname();
  const pagerViewRef = useRef(null);

  const { userData } = useUserDataStore();

  const [lists, setLists] = useState<ListData[] | null>([...userData.listsOwned, ...userData.listsSharedWithMe]);
  const [activeTab, setActiveTab] = useState<string | null>(lists[0].listName);

  const [newListName, setNewListName] = useState<string>("");
  const [createNewListModal, setCreateNewListModal] = useState(false);

  const [heartColors, setHeartColors] = useState<{ [key: string]: string }>({});  

  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentData>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);

//   useEffect(() => {
//     setMoveModalVisible(false);
//     const loadContent = async () => {
//       if (pathname === "/LibraryPage") {
//         try {
//           // Load saved tabs from AsyncStorage
//           const savedTabs = await AsyncStorage.getItem(STORAGE_KEY);
//           if (savedTabs) {
//             const parsedTabs: WatchList = savedTabs
//                         ? sortTabs({ ...DEFAULT_TABS, ...JSON.parse(savedTabs) }) // Ensure tabs are sorted
//                         : DEFAULT_TABS;
//             setTabs(parsedTabs);

//             const newPosterLists = await turnTabsIntoPosterTabs(parsedTabs);
//             setPosterTabs(newPosterLists);            

//             // Initialize heartColors based on the Favorite tab
//             const savedHeartColors = Object.values(parsedTabs).flat().reduce<{ [key: string]: string }>((acc, content: Content) => {
//               acc[content.id] = parsedTabs.Favorite.some((fav) => fav.id === content.id)
//                 ? Colors.selectedHeartColor
//                 : Colors.unselectedHeartColor;
//               return acc;
//             }, {});
//             setHeartColors(savedHeartColors);
//           }
//         } catch (error) {
//           console.error('Error loading library content:', error);
//         } finally {
//           setIsLoading(false);
//           await SplashScreen.hideAsync();
//         }
//       }
//     };

//     loadContent();
//   }, []);  

//   useEffect(() => {
//     const reFetch = async () => {
//       if (pathname === "/LibraryPage") {
//         if (Global.backPressLoadLibrary) {
//           // console.log("LIBRARY back press load begin");
//           // Re-initialize tabs

//           try {
//             // console.log("starting to pull lists");
//             // Load saved tabs from AsyncStorage
//             const savedTabs = await AsyncStorage.getItem(STORAGE_KEY);
//             if (savedTabs) {
//               const parsedTabs: WatchList = savedTabs
//                           ? sortTabs({ ...DEFAULT_TABS, ...JSON.parse(savedTabs) }) // Ensure tabs are sorted
//                           : DEFAULT_TABS;
//               setTabs(parsedTabs);
//               const newPosterLists = await turnTabsIntoPosterTabs(parsedTabs);
//               setPosterTabs(newPosterLists);   

//               // Initialize heartColors based on the Favorite tab
//               const savedHeartColors = Object.values(parsedTabs).flat().reduce<{ [key: string]: string }>((acc, content: Content) => {
//                 acc[content.id] = parsedTabs.Favorite.some((fav) => fav.id === content.id)
//                   ? Colors.selectedHeartColor
//                   : Colors.unselectedHeartColor;
//                 return acc;
//               }, {});
//               setHeartColors(savedHeartColors);
//               // console.log("SAVED lists");
//             }
//           } catch (error) {
//             console.error('Error loading library content:', error);
//           }
//         }

//         Global.backPressLoadLibrary = false;
//       }
//     }

//     reFetch();
//   }, [pathname]); // need this for this one


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


  const handleTabPress = async (listName: string) => {
    setActiveTab(listName);
    pagerViewRef.current?.setPage(lists.map(l => l.listName).indexOf(listName));

    // const savedTabs = await AsyncStorage.getItem(STORAGE_KEY);
    // if (savedTabs) {
    //   const parsedTabs: WatchList = savedTabs
    //                     ? sortTabs({ ...DEFAULT_TABS, ...JSON.parse(savedTabs) }) // Ensure tabs are sorted
    //                     : DEFAULT_TABS;
    //   setTabs(parsedTabs);
    //   const newPosterLists = await turnTabsIntoPosterTabs(parsedTabs);
    //   setPosterTabs(newPosterLists);
    // }
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
                // Global.backPressLoadLibrary = true;
                // router.push({
                //     pathname: '/InfoPage',
                //     params: { id: item.id },
                // });
                // router.push({
                //     pathname: '/InfoPage',
                //     params: { id: content.tmdb_ID, media_type: content.showType, vertical: content.verticalPoster, horizontal: content.horizontalPoster },
                // });
                router.push({
                    pathname: '/InfoPage',
                    params: { listName: activeTab, contentID: content.contentID },
                });
              // console.log(`Library clicked on: title ${item.title} | id ${item.id} `);
            }}
            onLongPress={() => {
              setSelectedItem(content);
              setMoveModalVisible(true);
            }}
          >
            <Image
              source={{
                  uri: content.verticalPoster || 
                      (console.log(`Library poster missing for: ${content.title} | poster: ${content.verticalPoster}`), 
                        // reloadMissingImages(item), 
                        "https://example.com/default-image.jpg")
                }}
              style={styles.movieImage}
            />
            <Text style={styles.movieTitle}>{content.title}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  if (isLoading) {
    return null; // Show splashcreen until loaded
  }

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
              onPress={async () => await handleTabPress(listName)}
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
      {/* {selectedItem && (
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
                Move "{selectedItem?.title}" to:
              </Text>
              {selectedItem && (
                <>
                  Render all tabs except FAVORITE_TAB
                  {Object.keys(tabs)
                    .filter((tab) => tab !== FAVORITE_TAB)
                    .map((tab, index) => (
                      <TouchableOpacity
                        key={`LandingPage-${selectedItem.id}-${tab}-${index}`}
                        style={[
                          appStyles.modalButton,
                          isItemInList(selectedItem, tab, tabs) && appStyles.selectedModalButton,
                        ]}
                        onPress={async () => await moveItemToTab(selectedItem, tab, setTabs, setPosterTabs, [setMoveModalVisible], null)}
                      >
                        <Text style={appStyles.modalButtonText}>
                          {tab} {isItemInList(selectedItem, tab, tabs) ? "✓" : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}

                  Render FAVORITE_TAB at the bottom
                  {tabs[FAVORITE_TAB] && (
                    <View
                      key={`LandingPage-${selectedItem.id}-heart`}
                      style={{ paddingTop: 10 }}
                    >
                      <Heart
                        heartColor={
                          heartColors[selectedItem?.id] || Colors.unselectedHeartColor
                        }
                        size={35}
                        onPress={async () => await moveItemToTab(selectedItem, FAVORITE_TAB, setTabs, setPosterTabs, [setMoveModalVisible], setHeartColors)}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </Pressable>
        </Modal>
      )} */}
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
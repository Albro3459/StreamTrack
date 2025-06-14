import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import Heart from './components/heartComponent';
import { Content, PosterContent } from './types/contentType';
// import { getContentById, getPostersFromContent, searchByKeywords } from './helpers/fetchHelper';
import { router, usePathname } from 'expo-router';
import { appStyles } from '@/styles/appStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Global, STORAGE_KEY } from '@/Global';
import { PosterList, WatchList } from './types/listsType';
// import { DEFAULT_TABS, FAVORITE_TAB, isItemInList, moveItemToTab, sortTabs, turnTabsIntoPosterTabs } from './helpers/listHelper';
import { Feather, Ionicons } from '@expo/vector-icons';
import FilterModal from './components/filterModalComponent';
import { Filter } from './types/filterTypes';
import { TMDBSearch } from './helpers/APIHelper';
import { TMDB_Content, TMDB } from './types/tmdbType';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SearchPage() {
  const pathname = usePathname();

  const [onPageLoad, setOnPageLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPaidOptions, setSelectedPaidOptions] = useState([]);

  const [heartColors, setHeartColors] = useState<{ [key: string]: string }>();

//   const [lists, setLists] = useState<WatchList>(DEFAULT_TABS);
//   const [posterLists, setPosterLists] = useState<PosterList>(DEFAULT_TABS as PosterList);

  const [selectedResult, setSelectedResult] = useState<Content>(null);
  const [searchAddToListModal, setSearchAddToListModal] = useState(false);

//   type Movie = {
//     id: string;
//     rating: number;
//     content: PosterContent | null;
//   };
  type Movie = {
    id: string;
    rating: number;
    content: TMDB_Content | null;
  };
  const [movies, setMovies] = useState<Movie[]>([]);

  const handleFilterModalCancel = () => {
    setIsFilterModalVisible(false);
    setSelectedGenres([]);
    setSelectedTypes([]);
    setSelectedServices([]);
    setSelectedPaidOptions([]);
    return;
  };

  const handleFilterModalSubmit = async () => {
    setIsFilterModalVisible(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

    const search = async (searchText: string) => {
        if (searchText.length > 0) {
            const content: TMDB = await TMDBSearch(searchText);
            const movies: Movie[] = content.results.map(x => {
                return {
                    id: x.id.toString(),
                    rating:  parseFloat((x.vote_average/2).toFixed(2)), // rating is on 10 pt scale so this converts to 5 star scale
                    content: x,
                }
            });
            setMovies(movies);
        }
    };

  return (
    <Pressable style={{height: screenHeight-70}} onPress={Keyboard.dismiss}>
    <View style={[styles.container]}>
        {/* Search Bar */}
        <View style={{flexDirection: "row", columnGap: 10, justifyContent: "center"}} >
            <Pressable 
                style={{paddingTop: 5}} 
                onPress={async () => await search(searchText)}
                // onPress={async () => await search(searchText, { selectedGenres, selectedTypes, selectedServices, selectedPaidOptions} as Filter )}
            >
                <Feather name="search" size={28} color="white" />
          </Pressable>
          <TextInput
            ref={searchInputRef}
            style={[styles.searchBar, {flex: 1}]}
            placeholder="Search for a movie or TV show..."
            placeholderTextColor={Colors.reviewTextColor}
            value={searchText}
            // onChangeText={async (text) => await search(text, { selectedGenres, selectedTypes, selectedServices, selectedPaidOptions} as Filter )} // searching on type but we cant do tat with the api :(. its too slow
            onChangeText={(text) => setSearchText(text)}
            //{/*// Trigger search on Enter */}
            // onSubmitEditing={async () => await search(searchText, { selectedGenres, selectedTypes, selectedServices, selectedPaidOptions} as Filter )}
            returnKeyType="search" // makes the return key say search
            clearButtonMode='while-editing'
            autoFocus
          />
          <Pressable onPress={() => setIsFilterModalVisible(true)}>
            <Ionicons name="filter-circle-outline" color={"white"} size={35} />
          </Pressable>
        </View>

        {/* ADD FILTERING */}
        <FilterModal 
          visible={isFilterModalVisible} 
          initialValues={ {selectedGenres, selectedTypes, selectedServices, selectedPaidOptions} }
          setTypes={ {setSelectedGenres, setSelectedTypes, setSelectedServices, setSelectedPaidOptions } }
          onSubmit={async () =>  await handleFilterModalSubmit()}
          onCancel={handleFilterModalCancel}
        />

        {/* Movie Cards */}
        {(!movies || movies.length <= 0) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: -80 }}>
              {searchText.length <= 0 && onPageLoad ? "Try Searching for a Show or Movie!" : "No Results :("}
            </Text>
          </View>
        ) : (
          <FlatList<Movie>
            ref={flatListRef}
            data={movies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                    onPress={() => {
                    //   Global.backPressLoadSearch = true;
                      router.push({
                          pathname: '/InfoPage',
                          params: { id: item.id, media_type: item.content.media_type, vertical: item.content.poster_path, horizontal: item.content.backdrop_path },
                      });
                    }}
                    // onLongPress={() => {setSelectedResult(item.content); setSearchAddToListModal(true);}}
                >
                <View style={appStyles.cardContainer}>
                  {/* <Image source={{ uri: item.content.posters.vertical }} style={appStyles.cardPoster} /> */}
                    <Image source={{ uri: item.content.poster_path }} style={appStyles.cardPoster} />
                    <View style={appStyles.cardContent}>
                        {/* <Text style={appStyles.cardTitle}>{item.content.title}</Text> */}
                        <Text style={appStyles.cardTitle}>{item.content.media_type === "movie" ? item.content.title : item.content.name}</Text>
                        <Text style={appStyles.cardDescription}>{item.content.overview}</Text>
                        <Text style={appStyles.cardRating}>⭐ {item.rating}</Text>
                    </View>
                    <Heart 
                        heartColor={(heartColors && heartColors[item.id]) || Colors.unselectedHeartColor}
                        size={40}
                        // onPress={async () => await moveItemToTab(item.content, FAVORITE_TAB, setLists, setPosterLists, [setSearchAddToListModal], setHeartColors)}
                    />
                </View>
              </Pressable>
            )}
          />
        )}

      {/* Move Modal */}
      {/* {selectedResult && (
        <Modal
          transparent={true}
          visible={searchAddToListModal}
          animationType="fade"
          onRequestClose={() => setSearchAddToListModal(false)}
        >
          <Pressable
            style={appStyles.modalOverlay}
            onPress={() => setSearchAddToListModal(false)}
          >
            <View style={appStyles.modalContent}>
              <Text style={appStyles.modalTitle}>
                Move "{selectedResult?.title}" to:
              </Text>
              {selectedResult && (
                <>
                  Render all tabs except FAVORITE_TAB
                  {Object.keys(lists)
                    .filter((tab) => tab !== FAVORITE_TAB)
                    .map((tab, index) => (
                      <TouchableOpacity
                        key={`LandingPage-${selectedResult.id}-${tab}-${index}`}
                        style={[
                          appStyles.modalButton,
                          isItemInList(selectedResult, tab, lists) && appStyles.selectedModalButton,
                        ]}
                        onPress={async () => await moveItemToTab(selectedResult, tab, setLists, setPosterLists, [setSearchAddToListModal], null)}
                      >
                        <Text style={appStyles.modalButtonText}>
                          {tab} {isItemInList(selectedResult, tab, lists) ? "✓" : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}

                  Render FAVORITE_TAB at the bottom
                  {lists[FAVORITE_TAB] && (
                    <View
                      key={`LandingPage-${selectedResult.id}-heart`}
                      style={{ paddingTop: 10 }}
                    >
                      <Heart
                        heartColor={
                          heartColors[selectedResult?.id] || Colors.unselectedHeartColor
                        }
                        size={35}
                        onPress={async () => await moveItemToTab(selectedResult, FAVORITE_TAB, setLists, setPosterLists, [setSearchAddToListModal], setHeartColors)}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </Pressable>
        </Modal>
      )} */}

      {/* Loading Overlay */}
      <Modal visible={isSearching} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        </View>
      </Modal>
    </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    padding: 16,
    paddingTop: 35,
    paddingBottom: 70
  },
  searchBar: {
    backgroundColor: Colors.cardBackgroundColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: '#FFFFFF',
    marginBottom: 20,
    fontSize: 16,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});
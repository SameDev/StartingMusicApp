import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './SearchScreen/SearchScreen'; // Ajuste o caminho
import AlbumScreen from './SearchScreen/AlbumScreen'; 
// import ArtistaScreen from './ArtistaScreen'; // Ajuste o caminho
// import PlaylistScreen from './PlaylistScreen'; // Ajuste o caminho
import MusicPlayerScreen from './SearchScreen/MusicPlayerScreen'; // Ajuste o caminho

type SearchStackParamList = {
  Search: undefined;
  Album: { albumId: string };
  Artista: { artistId: string };
  Playlist: { playlistId: string };
  MusicPlayer: { musicId: string };
};

const SearchStack = createNativeStackNavigator<SearchStackParamList>();

const SearchNavigator: React.FC = () => {
  return (
    <SearchStack.Navigator initialRouteName="Search"
        screenOptions={{headerShown: false}}
    >
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Album" component={AlbumScreen} />
      {/* <SearchStack.Screen name="Artista" component={ArtistaScreen} />
      <SearchStack.Screen name="Playlist" component={PlaylistScreen} /> */}
      <SearchStack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
    </SearchStack.Navigator>
  );
};

export default SearchNavigator;

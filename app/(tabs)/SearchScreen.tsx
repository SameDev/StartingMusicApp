import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Album, Music, User } from '@/types/apiRef';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from "@expo/vector-icons";
import { usePlayer } from '@/components/PlayerProvider';
const MyTheme = useThemeColor;
type RootStackParamList = {
  SearchScreen: undefined;
  MusicPlayer: undefined;
  Artista: { artistId: string };
  Album: { album: Album };
  Playlist: { playlistId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchScreen'>;

interface SearchResults {
  albums: Album[];
  song: Music[];
  playlists: Music[];
  artists: User[];
}

const SearchScreen: React.FC = () => {
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    albums: [],
    song: [],
    playlists: [],
    artists: [],
  });
  const [loading, setLoading] = useState(false);

  const { setCurrentSong } = usePlayer();

  const navigation = useNavigation<NavigationProp>();
  

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://starting-music.onrender.com/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      setResults({
        albums: data.albums || [],
        song: data.music || [],
        playlists: data.playlists || [],
        artists: data.users || [],
      });
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSongPress = (song: Music) => {
    setCurrentSong(song as unknown as Music); 
    navigation.navigate('MusicPlayer'); 
  };

  const renderMusicItem = useCallback(
    ({ item }: { item: Music }) => (
      <View
        style={styles.musicItem}
        onTouchEnd={() => handleSongPress(item)}
      >
        <Image source={{ uri: item.image_url }} style={styles.musicImage} />
        <View style={styles.musicInfo}>
          <Text style={styles.musicName}>{item.nome}</Text>
          <Text style={styles.musicArtist}>
            {item.artista} • {item.duracao}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleSongPress(item)}>
          <FontAwesome
                name={"play"}
                size={20}
                color="#fff"
              />
          </TouchableOpacity>
      </View>
    ),
    [navigation]
  );

  const renderArtistItem = useCallback(
    ({ item }: { item: User }) => {
      if (item.cargo === 'USUARIO') return null;

      return (
        <View
          style={styles.musicItem}
          onTouchEnd={() => navigation.navigate('Artista', { artistId: item.id })}
        >
          <Image
            source={{
              uri:
                item.foto_perfil ||
                'https://starting-music-artista.vercel.app/user-placeholder.jpeg',
            }}
            style={styles.musicImage}
          />
          <View style={styles.musicInfo}>
            <Text style={styles.musicName}>{item.nome}</Text>
          </View>
        </View>
      );
    },
    [navigation]
  );

  const renderAlbumItem = useCallback(
    ({ item }: { item: Album }) => (
      <View
        style={styles.musicItem}
        onTouchEnd={() => navigation.navigate('Album', { album: item })}
      >
        <Image
          source={{
            uri:
              item.image_url ||
              'https://starting-music-artista.vercel.app/user-placeholder.jpeg',
          }}
          style={styles.musicImage}
        />
        <View style={styles.musicInfo}>
          <Text style={styles.musicName}>{item.nome}</Text>
          <Text style={styles.musicArtist}>
            {item.lancamento.toUpperCase()} • {item.artista}
          </Text>
        </View>
      </View>
    ),
    [navigation]
  );

  const renderPlaylistItem = useCallback(
    ({ item }: { item: Music }) => (
      <View
        style={styles.musicItem}
        onTouchEnd={() => navigation.navigate('Playlist', { playlistId: item.id })}
      >
        <Image
          source={{
            uri:
              item.image_url ||
              'https://starting-music-artista.vercel.app/user-placeholder.jpeg',
          }}
          style={styles.musicImage}
        />
        <View style={styles.musicInfo}>
          <Text style={styles.musicName}>{item.nome}</Text>
        </View>
      </View>
    ),
    [navigation]
  );

  const renderSection = (title: string, data: any[], renderItem: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList 
      scrollEnabled={false}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.noResultsText}>Nenhum {title.toLowerCase()} encontrado</Text>
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Digite o nome da música ou artista"
        placeholderTextColor="#ccc"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={fetchSearchResults}
      />
      <ScrollView>
        {loading ? (
          <Text style={styles.loadingText}>Buscando...</Text>
        ) : (
          <>
            {results.albums.length > 0 && renderSection('Álbuns', results.albums, renderAlbumItem)}
            {results.song.length > 0 && renderSection('Músicas', results.song, renderMusicItem)}
            {results.playlists.length > 0 &&
              renderSection('Playlists', results.playlists, renderPlaylistItem)}
            {results.artists.length > 0 && renderSection('Artistas', results.artists, renderArtistItem)}
            {results.albums.length === 0 &&
              results.song.length === 0 &&
              results.playlists.length === 0 &&
              results.artists.length === 0 && (
                <Text style={styles.noResultsText}>Nenhum resultado encontrado</Text>
              )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 50,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
    marginBottom: 10,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  noResultsText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: MyTheme.colors.secondary,
    borderRadius: 5,
  },
  musicImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  musicArtist: {
    color: '#ccc',
    fontSize: 14,
  },
});

export default SearchScreen;

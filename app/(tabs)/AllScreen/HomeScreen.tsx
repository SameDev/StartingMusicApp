import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl, 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchSongs, fetchArtists } from '@/api/api';
import { Music, MusicRec, User } from '@/types/apiRef';
import { useThemeColor } from '@/hooks/useThemeColor';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons/faArrowsRotate'
const MyTheme = useThemeColor;

import { usePlayer } from '@/components/PlayerProvider';
import { TouchableWithoutFeedback } from 'react-native';

type RootStackParamList = {
  HomeScreen: any;
  MusicPlayer: undefined;
  ArtistaScreen: {};
  UserScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

const PLACEHOLDER_ARTIST_IMAGE = 'https://starting-music-artista.vercel.app/user-placeholder.jpeg';

const HomeScreen = () => {
  const [songs, setSongs] = useState<MusicRec[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<User>();

  const navigation = useNavigation<NavigationProp>();
  const { setCurrentSong, setPlaylist } = usePlayer();

  const loadUserData = async () => {
    const storedUserData = await AsyncStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserData(user);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const getCachedSongs = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('cachedSongs');
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Erro ao buscar músicas cacheadas:', error);
      return null;
    }
  };

  const cacheSongs = async (songsData: MusicRec[]) => {
    try {
      await AsyncStorage.setItem('cachedSongs', JSON.stringify(songsData));
    } catch (error) {
      console.error('Erro ao cachear músicas:', error);
    }
  };

  const getSongs = async (userId: number, forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = await getCachedSongs();
      if (cachedData) {
        setSongs(cachedData);
        return;
      }
    }

    try {
      const response = await fetchSongs(userId);
      if (Array.isArray(response)) {
        setSongs(response);
        await cacheSongs(response);
      } else {
        throw new Error('Formato inesperado na resposta de músicas.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as músicas.');
      console.error('Erro ao buscar músicas:', error);
    }
  };

  const getArtists = async () => {
    try {
      const data = await fetchArtists();
      if (Array.isArray(data)) {
        setArtists(data);
      } else {
        throw new Error('Formato inesperado na resposta de artistas.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os artistas.');
      console.error('Erro ao buscar artistas:', error);
    }
  };

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  const refreshSongs = async () => {
    setRefreshing(true);
    try {
      loadUserData();
      const user = await getUserData();
      if (user?.id) {
        await getSongs(user.id, true);
      } else {
        Alert.alert('Erro', 'Usuário não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao atualizar músicas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getUserData();
        if (user?.id) {
          await getSongs(user.id);
          await getArtists();
        } else {
          Alert.alert('Erro', 'Usuário não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSongPress = (selectedSong: MusicRec) => {
    const queue = songs.slice(
      songs.findIndex((song) => song.id === selectedSong.id)
    );
    
    setPlaylist(queue.map((song) => song as unknown as Music));
  
    setCurrentSong(queue[0] as unknown as Music);
  
    navigation.navigate('MusicPlayer');
  };
  
  const renderSongItem = (song: MusicRec) => (
    <TouchableOpacity
      style={styles.songCard}
      key={`song-${song.id}`}
      onPress={() => handleSongPress(song)}
    >
      <Image
        source={{ uri: song.image_url || 'https://starting-music-artista.vercel.app/img-placeholder.png' }}
        style={styles.songImage}
      />
      <Text style={styles.songName}>{song.nome}</Text>
      <Text style={styles.artistName}>{song.artista}</Text>
    </TouchableOpacity>
  );

  const renderArtistItem = (artista: User) => (
    <TouchableOpacity
      style={styles.artistCard}
      key={`artist-${artista.id}`}
      onPress={() => navigation.navigate('ArtistaScreen', { artist: artista })}
    >
      <Image
        source={{ uri: artista.foto_perfil || PLACEHOLDER_ARTIST_IMAGE }}
        style={styles.artistImage}
      />
      <Text style={styles.artistName}>{artista.nome}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={refreshSongs} 
          tintColor="#fff"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olá, {userData?.nome}</Text>
        
        <TouchableWithoutFeedback onPress={() => {navigation.navigate('UserScreen')}}>
          <Image
            source={{ uri: userData?.foto_perfil || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
        </TouchableWithoutFeedback>
      </View>
      <Image
        source={require('@/assets/images/banner.png')}
        resizeMode="contain"
        style={styles.featuredImage}
      />

      <View style={styles.section}>
        <View style={styles.sectionTitleView}>
          <Text style={styles.sectionTitle}>Escolhas feitas para você</Text>
          <TouchableOpacity
            style={styles.sectionTitleButton}
            onPress={refreshSongs}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size={15}
                color="#fff"
              />
            ) : (
              <FontAwesomeIcon
                icon={faArrowsRotate}
                size={15}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {songs.length > 0 ? (
            songs.map(renderSongItem)
          ) : (
            <Text style={styles.emptyMessage}>Nenhuma recomendação disponível.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Novos Artistas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {artists.length > 0 ? (
            artists.map(renderArtistItem)
          ) : (
            <Text style={styles.emptyMessage}>Nenhum artista disponível.</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MyTheme.colors.background,
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-between'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 60,
    marginRight: 10
  },
  loadingContainer: {
    backgroundColor: MyTheme.colors.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  featuredImage: {
    width: '100%',
    height: 260,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  sectionTitleButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#32323d",
    elevation: 5,
    padding: 10,
    borderRadius: 50
  },
  sectionTitle: {
    flex: 8,
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  songCard: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  songImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  songName: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  artistName: {
    color: '#aaa',
    fontSize: 12,
  },
  artistCard: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  emptyMessage: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HomeScreen;

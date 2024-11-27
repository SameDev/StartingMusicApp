import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSongs, fetchArtists } from '@/api/api';
import { MusicRec, User } from '@/types/apiRef';

const PLACEHOLDER_ARTIST_IMAGE = 'https://starting-music-artista.vercel.app/user-placeholder.jpeg';

const HomeScreen = () => {
  const [songs, setSongs] = useState<MusicRec[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch songs based on user ID
  const getSongs = async (userId: number) => {
    try {
      const response = await fetchSongs(userId);
      if (Array.isArray(response)) {
        setSongs(response);
      } else {
        throw new Error('Formato inesperado na resposta de músicas.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as músicas.');
      console.error('Erro ao buscar músicas:', error);
    }
  };

  // Fetch artists
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

  // Fetch user data from storage
  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
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

  // Render individual song item
  const renderSongItem = (song: MusicRec) => (
    <TouchableOpacity style={styles.songCard} key={`song-${song.id}`}>
      <Image source={{ uri: song.image_url }} style={styles.songImage} />
      <Text style={styles.songName}>{song.name}</Text>
      <Text style={styles.artistName}>{song.artist}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {song.tags.map((tag, index) => (
          <Text key={`tag-${song.id}-${index}`} style={styles.tag}>
            {tag.name}
          </Text>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );

  // Render individual artist item
  const renderArtistItem = (artist: User) => (
    <View style={styles.artistCard} key={`artist-${artist.id}`}>
      <Image
        source={{ uri: artist.foto_perfil || PLACEHOLDER_ARTIST_IMAGE }}
        style={styles.artistImage}
      />
      <Text style={styles.artistName}>{artist.nome}</Text>
    </View>
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
    <ScrollView style={styles.container}>
      <Image
        source={require('@/assets/images/banner.png')}
        resizeMode="contain"
        style={styles.featuredImage}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendações</Text>
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
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
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
  sectionTitle: {
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
  tag: {
    color: '#aaa',
    fontSize: 10,
    marginHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  emptyMessage: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HomeScreen;

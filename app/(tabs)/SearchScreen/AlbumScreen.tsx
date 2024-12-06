import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
    Search: undefined;
    MusicPlayer: { musicId: string };
    Artista: { artistId: string };
    Album: { albumId: string };
    Playlist: { playlistId: string };
  };

type AlbumRouteProp = RouteProp<RootStackParamList, 'Album'>;

const AlbumScreen: React.FC = () => {
  const route = useRoute<AlbumRouteProp>();
  const { albumId } = route.params;

  const [album, setAlbum] = useState<any>(null);
  const [musicas, setMusicas] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const albumResponse = await fetch(`https://api.exemplo.com/album/${albumId}`); 
        const albumData = await albumResponse.json();
        setAlbum(albumData);

        const musicasResponse = await fetch(`https://api.exemplo.com/album/${albumId}/musicas`); // Substitua pela URL real da API
        const musicasData = await musicasResponse.json();
        setMusicas(musicasData);
      } catch (error) {
        console.error('Erro ao buscar dados do álbum:', error);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  if (!album) {
    return <Text>Carregando...</Text>; // Exibe enquanto os dados não são carregados
  }

  const renderMusicItem = ({ item }: { item: any }) => (
    <View style={styles.musicItem}>
      <Image source={{ uri: album.capa }} style={styles.musicImage} />
      <View style={styles.musicInfo}>
        <Text style={styles.musicName}>{item.nome}</Text>
        <Text style={styles.musicArtist}>{item.artista}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header do álbum */}
      <View style={styles.albumHeader}>
        <Image source={{ uri: album.capa }} style={styles.albumImage} />
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.nome}</Text>
          <Text style={styles.albumDetails}>
            {album.artista} • {album.lancamento} • {musicas.length} músicas • {album.duracao}
          </Text>
          <Text style={styles.albumDescription}>{album.descricao}</Text>
        </View>
      </View>

      {/* Lista de músicas */}
      <FlatList
        data={musicas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMusicItem}
        contentContainerStyle={styles.musicList}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 15,
  },
  albumHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  albumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  albumDetails: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  albumDescription: {
    fontSize: 12,
    color: '#aaa',
  },
  musicList: {
    marginTop: 10,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  musicImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  musicArtist: {
    fontSize: 14,
    color: '#ccc',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 5,
    marginLeft: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default AlbumScreen;

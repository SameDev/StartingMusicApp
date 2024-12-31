import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { Album, Music, User } from '@/types/apiRef';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePlayer } from '@/components/PlayerProvider';

const MyTheme = useThemeColor;

const PLACEHOLDER_ARTIST_IMAGE = 'https://starting-music-artista.vercel.app/user-placeholder.jpeg';

const ArtistScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const artist = (route.params as User).artist;

  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);

  const { setCurrentSong, clearPlaylist, setPlaylist } = usePlayer();

  const handleSongPress = async (song: Music) => {
    try {
      clearPlaylist()
      await setPlaylist(songs);
      await setCurrentSong(song);
      navigation.navigate('MusicPlayer');
    } catch (error) {
      console.error('Error handling song press:', error);
    }
  };
  const handleAlbumPress = async (album: Album) => {
    try {
      navigation.navigate('AlbumScreen', {album});
    } catch (error) {
      console.error('Error handling song press:', error);
    }
  };

  useEffect(() => {
    fetch(`https://starting-music.onrender.com/user/album/${artist.id}`)
      .then((res) => res.json())
      .then((data) => setAlbums(data || []))
      .catch((err) => console.error('Error fetching albums:', err));

    fetch(`https://starting-music.onrender.com/user/songs/${artist.id}`)
      .then((res) => res.json())
      .then((data) => setSongs(data || []))
      .catch((err) => console.error('Error fetching songs:', err));
  }, [artist.id]);

  const image = {
    uri: artist.banner_perfil || 'https://starting-music-artista.vercel.app/banner.png',
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.bannerImage}>
        <View style={styles.overlay} />

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <FontAwesome6 name="arrow-left-long" color="#fff" size={30} />
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.headerContainer}>
          <Image
            source={{ uri: artist.foto_perfil || PLACEHOLDER_ARTIST_IMAGE }}
            style={styles.artistImage}
          />
          <Text style={styles.artistName}>{artist.nome}</Text>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <Text style={styles.artistBio}>
          {artist.desc || 'Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!'}
        </Text>

        <View style={styles.tagsContainer}>
          {artist.tags?.map((tag: { id: number; nome: string }) => (
            <View key={tag.id} style={styles.tag}>
              <Text style={styles.tagText}>{tag.nome}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionHeader}>Álbuns do Artista</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {albums.length > 0 ? (
            albums.map((album: any) => (
              <View key={album.id} style={styles.albumCard} onTouchEnd={() => handleAlbumPress(album)}>
                <Image source={{ uri: album.image_url || PLACEHOLDER_ARTIST_IMAGE }} style={styles.albumImage} />
                <Text style={styles.albumTitle}>{album.nome}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>Nenhum álbum disponível.</Text>
          )}
        </ScrollView>

        <Text style={styles.sectionHeader}>Músicas do Artista</Text>
        {songs.length > 0 ? (
          songs.map((song: any) => (
            <View style={styles.musicItem} key={`song-${song.id}`} onTouchEnd={() => handleSongPress(song)}>
              <Image source={{ uri: song.image_url }} style={styles.musicImage} />
              <View style={styles.musicInfo}>
                <Text style={styles.musicName}>{song.nome}</Text>
                <Text style={styles.musicArtist}>
                  {song.artista} • {song.duracao}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleSongPress(song)}>
                <FontAwesome name={"play"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyMessage}>Nenhuma música disponível.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyTheme.colors.background,
  },
  bannerImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  contentContainer: {
    backgroundColor: MyTheme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -20,
  },
  artistBio: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: MyTheme.colors.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  musicArtist: {
    color: '#ccc',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  albumCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  albumImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  albumTitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  songDuration: {
    fontSize: 14,
    color: '#aaa',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 10,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: MyTheme.colors.secondary,
    borderRadius: 5,
    justifyContent: 'space-between',
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
});

export default ArtistScreen;

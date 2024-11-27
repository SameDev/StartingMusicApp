import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchSongs } from '@/api/api'; 
import { Music } from '@/types/apiRef';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MusicList: undefined;
  MusicPlayer: { song: Music }; 
};

type MusicListNavigationProp = StackNavigationProp<RootStackParamList, 'MusicList'>;

export default function MusicList() {
  const [songs, setSongs] = useState<Music[]>([]); 
  const [loading, setLoading] = useState(true); 
  const navigation = useNavigation<MusicListNavigationProp>();

  const getSongs = async () => {
    try {
      const data = await fetchSongs();
      setSongs(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as músicas.');
    } finally {
      setLoading(false); 
    }
  };

  getSongs();

  const playSong = (song: Music) => {
    navigation.navigate('MusicPlayer', { song });
  };

  const renderSongItem = ({ item }: { item: Music }) => (
    <View style={styles.songContainer}>
      <Image source={{ uri: item.image_url }} style={styles.albumArt} />
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.nome}</Text>
        <Text style={styles.artistName}>{item.artista}</Text>
      </View>
      <TouchableOpacity onPress={() => playSong(item)}>
        <FontAwesome 
          name="play" 
          size={30} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={renderSongItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  songInfo: {
    marginLeft: 10,
    flex: 1,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#aaa',
    fontSize: 14,
  },
});

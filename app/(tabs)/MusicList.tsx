import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchSongs } from '@/api/api'; 
import { Music } from '@/types/apiRef';

export default function MusicList() {
  const [songs, setSongs] = useState<Music[]>([]); 
  const navigation = useNavigation();  // Para navegação

  useEffect(() => {
    const getSongs = async () => {
      const data = await fetchSongs();
      setSongs(data);
    };
    getSongs();
  }, []);

  // Função para alternar a reprodução e navegar para o player
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
      {/* Botão Play */}
      <TouchableOpacity onPress={() => playSong(item)}>
        <FontAwesome 
          name="play" 
          size={30} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );

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

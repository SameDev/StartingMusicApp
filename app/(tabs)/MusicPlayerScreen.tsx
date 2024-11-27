import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Music } from '@/types/apiRef';

const MusicPlayerScreen = () => {
  const route = useRoute();
  const { song } = route.params as { song: Music };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Função para carregar e reproduzir a música
  const playSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.url }
    );

    setSound(newSound);
    await newSound.playAsync();
    setIsPlaying(true);
  };

  // Função para pausar a música
  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Limpa o som ao desmontar o componente
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: song.image_url }} 
        style={styles.albumArt}
      />
      
      <Text style={styles.songTitle}>{song.nome}</Text>
      <Text style={styles.artistName}>{song.artista}</Text>

      <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <FontAwesome name="heart-o" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={playSound}>
          <FontAwesome name="play" size={50} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pauseSound}>
          <FontAwesome name="pause" size={50} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  songTitle: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
  },
  artistName: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  }
});

export default MusicPlayerScreen;
 
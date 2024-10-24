import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const MusicPlayerScreen = () => {
  const route = useRoute();  // Para acessar os parâmetros
  const { song } = route.params;  // Recebe a música passada como parâmetro

  return (
    <View style={styles.container}>
      {/* Imagem do álbum */}
      <Image 
        source={{ uri: song.image_url }} 
        style={styles.albumArt}
      />
      
      {/* Nome da música e artista */}
      <Text style={styles.songTitle}>{song.nome}</Text>
      <Text style={styles.artistName}>{song.artista}</Text>

      {/* Controles do player */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <FontAwesome name="heart-o" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="step-backward" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="play" size={50} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="step-forward" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="random" size={30} color="#fff" />
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

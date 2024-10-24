import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Seção de Destaque */}
      <View style={styles.featured}>
        <Text style={styles.featuredText}>Conheça as músicas em DESTAQUE</Text>
        <Image
          source={{ uri: 'https://link-imagem' }}
          style={styles.featuredImage}
        />
      </View>

      {/* Recomendações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendações</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Repetir componente de recomendação */}
          <Image source={{ uri: 'https://link-imagem' }} style={styles.songCard} />
          {/* Outras recomendações */}
        </ScrollView>
      </View>

      {/* Novos Artistas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Novos Artistas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Repetir componente de artista */}
          <Image source={{ uri: 'https://link-imagem' }} style={styles.artistCard} />
          {/* Outros artistas */}
        </ScrollView>
      </View>

      {/* Top Playlists dos Usuários */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Playlists dos Usuários</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Repetir componente de playlist */}
          <View style={styles.playlistCard}></View>
          {/* Outras playlists */}
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
  featured: {
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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
    height: 120,
    marginRight: 10,
  },
  artistCard: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 60,
  },
  playlistCard: {
    width: 100,
    height: 100,
    backgroundColor: '#444',
    marginRight: 10,
    borderRadius: 10,
  },
});

export default HomeScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Pressable,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from '@/types/apiRef';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PanGestureHandler } from 'react-native-gesture-handler';

const MyTheme = useThemeColor;

type RootStackParamList = {
  LibraryScreen: undefined;
  Curtidas: undefined;
  PlaylistScreen: {};
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LibraryScreen'>;

const LibraryScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<User>();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const loadPlaylists = async () => {
    if (!userData?.id) return;
    try {
      const response = await fetch(`https://starting-music.onrender.com/playlist/${userData.id}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (response.ok) {
        setPlaylists(data.playlists || []);
      } else {
        console.error('Erro', data.message || 'Erro ao carregar as playlists.');
      }
    } catch (error) {
      console.error('Erro ao carregar as playlists:', error);
      Alert.alert('Erro', 'Não foi possível carregar as playlists.');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlaylists();
    setRefreshing(false);
  }, [userData]);

  const handleCreatePlaylist = async () => {
    if (playlistName && playlistDescription) {
      const token = await AsyncStorage.getItem('jwtToken');
      try {
        const response = await fetch('https://starting-music.onrender.com/playlist/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            nome: playlistName,
            descricao: playlistDescription,
            tags: [],
            foto: '',
            userId: userData?.id,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert('Playlist Criada!', `Nome: ${data.playlist.nome}\nDescrição: ${data.playlist.descricao}`);
          setModalVisible(false);
          setPlaylistName('');
          setPlaylistDescription('');
          await loadPlaylists();
        } else {
          Alert.alert('Erro', data.message || 'Erro ao criar a playlist.');
        }
      } catch (error) {
        console.error('Erro ao criar playlist:', error);
        Alert.alert('Erro', 'Não foi possível criar a playlist.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  const handleDrag = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 150) {
      setModalVisible(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      loadPlaylists();
    }
  }, [userData]);

  return (
    <ScrollView style={styles.container}
    refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              tintColor="#fff"
            />
          }>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <PanGestureHandler onGestureEvent={handleDrag}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Adicionar Playlist</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da Playlist"
                value={playlistName}
                onChangeText={setPlaylistName}
                placeholderTextColor={MyTheme.colors.text}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição da Playlist"
                value={playlistDescription}
                onChangeText={setPlaylistDescription}
                multiline
                placeholderTextColor={MyTheme.colors.text}
              />

              <View style={styles.modalButtons}>
                <Pressable style={[styles.button, styles.buttonClose]} onPress={handleCreatePlaylist}>
                  <Text style={styles.textStyle}>Criar Playlist</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.buttonCancel]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.textStyle}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </PanGestureHandler>
      </Modal>

      <View style={styles.header}>
        <Image
          source={{ uri: userData?.foto_perfil || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <View style={styles.headerLib}>
          <Text style={styles.headerTitle}>Sua biblioteca</Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="playlist-plus" size={35} color="#fff" />
          </Pressable>
        </View>
      </View>

      <TouchableOpacity  
        style={[styles.item, { backgroundColor:'#402585' }]}
        onPress={() => navigation.navigate('Curtidas')}>
        <View style={styles.card}>
          <FontAwesome name="heart" color="#fff" size={30} />
        </View>
        <Text style={styles.title}>Suas curtidas</Text>
      </TouchableOpacity>


      {playlists.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, { backgroundColor: '#7F7EBA' }]}
          onPress={() => navigation.navigate('PlaylistScreen', item)}>
          <Image
            style={styles.cardImage}
            source={{ uri: item.foto || 'https://starting-music-artista.vercel.app/img-placeholder.png' }}
            resizeMode="cover"
          />
          <Text style={styles.title}>{item.nome}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MyTheme.colors.background,
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 10,
    backgroundColor: '#d1c4e9',
    borderRadius: 10,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom:5
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: MyTheme.colors.secondary,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: MyTheme.colors.card,
    borderRadius: 20,
    padding: 35,
    paddingVertical: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff'
  },
  input: {
    width: 350,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 8,
    color: '#fff',
    borderColor: MyTheme.colors.border,
    backgroundColor: MyTheme.colors.accent,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '48%',
  },
  buttonClose: {
    backgroundColor: MyTheme.colors.primary,
  },
  buttonCancel: {
    backgroundColor: '#E64575',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerLib: {
    flex: 1,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 60,
    marginBottom: 20,
    marginRight: 10,
  },
  title: {
    marginLeft: 7,    
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LibraryScreen;

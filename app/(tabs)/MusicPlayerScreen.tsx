import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Modal, FlatList, Alert } from "react-native";
import { FontAwesome6, MaterialIcons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { usePlayer } from "@/components/PlayerProvider";
import { runOnJS } from 'react-native-reanimated';
import { useThemeColor } from "@/hooks/useThemeColor";
import axios from 'axios';
import { RepeatMode } from "react-native-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Playlist } from '@/types/apiRef';

type RootStackParamList = {
  Search: undefined;
  HomeScreen: undefined;
  MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MusicPlayer">;

const MyTheme = useThemeColor;

const MusicPlayerScreen: React.FC = () => {
  const MyTheme = useThemeColor;
  const { currentSong, isPlaying, handlePlayPause, progress, duration, position, handleSeek, setIsPlayerVisible, playNext, playPrevious, toggleRepeatMode, repeatMode, toggleShuffle, isShuffled, isLiked, handleLike, isLoading, setLoading } = usePlayer();
  const navigation = useNavigation<NavigationProp>();

  const [songInfo, setSongInfo] = useState({
    name: '',
    artist: '',
    imageUrl: 'https://starting-music-artista.vercel.app/img-placeholder.png',
    duration: '' as unknown as number
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [jwtToken, setJwtToken] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedJwt = await AsyncStorage.getItem('jwtToken') || '';
      setJwtToken(storedJwt);

      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    setIsPlayerVisible(true);

    if (currentSong) {
      setLoading(true);
      setSongInfo({
        name: currentSong.nome || 'Título indisponível',
        artist: currentSong.artista || 'Artista desconhecido',
        imageUrl: currentSong.image_url || 'https://starting-music-artista.vercel.app/img-placeholder.png',
        duration
      });
      setLoading(false);
    } else {
      navigation.goBack();
    }

    return () => setIsPlayerVisible(false);
  }, [currentSong, setIsPlayerVisible, navigation]);

  const formatTime = (millis: number): string => {
    const minutes = Math.floor(millis / 60);
    const seconds = Math.floor(millis % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationX } = event;
      if (translationX > 50) {
        runOnJS(playPrevious)();
      } else if (translationX < -50) {
        runOnJS(playNext)();
      }
    });

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

  const addToPlaylist = async (playlistId: string) => {
    console.log(jwtToken)
    axios
      .post(`https://starting-music.onrender.com/playlist/add/song/${playlistId}`,
        {
          musicas: [currentSong?.id]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${jwtToken}`
          },
        })
      .then(() => {
        Alert.alert("Música adicionada a playlist!")
      })
      .catch((error) => {
        console.error("Erro ao remover música da playlist:", error);
      });
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <LinearGradient style={styles.mainContainer} colors={["#191A2E", "#231251"]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
            setIsPlayerVisible(false);
          }}
        >
          <FontAwesome6 name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.noSongContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Image source={{ uri: songInfo.imageUrl }} style={styles.albumArt} />
              <Text style={styles.songTitle}>{songInfo.name}</Text>
              <Text style={styles.artistName}>{songInfo.artist}</Text>

              <View style={styles.addContainer}>
                <TouchableOpacity onPress={handleLike}>
                  <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={30} color={isLiked ? '#E64575' : '#fff'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setModalVisible(true);
                  loadPlaylists();
                }}>
                  <MaterialCommunityIcons name="playlist-plus" size={35} color="#fff" />
                </TouchableOpacity>
              </View>

              <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={1}
                value={progress}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#aaa"
                thumbTintColor="#fff"
                onSlidingComplete={handleSeek}
              />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>{formatTime(position)}</Text>
                <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={toggleShuffle}>
                  <FontAwesome6 name="shuffle" size={30} color={isShuffled ? '#fff' : "#d9d9d9"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={playPrevious}>
                  <FontAwesome6 name="backward-step" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableWithoutFeedback onPress={() => handlePlayPause()}>
                  <View style={{
                    backgroundColor: '#fff',
                    width: 66,
                    height: 66,
                    borderRadius: 22,
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <MaterialIcons
                      style={{
                        width: 100,
                        height: 100,
                      }}
                      size={100}
                      name={isPlaying ? "pause-circle-filled" : "play-circle-filled"}
                      color={MyTheme.colors.primary}
                    />
                  </View>
                </TouchableWithoutFeedback>

                <TouchableOpacity onPress={playNext}>
                  <FontAwesome6 name="forward-step" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleRepeatMode}>
                  {repeatMode === RepeatMode.Off ? (
                    <MaterialIcons name="repeat" size={30} color="#d9d9d9" />
                  ) : repeatMode === RepeatMode.Track ? (
                    <MaterialIcons name="repeat-one" size={30} color="#fff" />
                  ) : repeatMode === RepeatMode.Queue ? (
                    <MaterialIcons name="repeat" size={30} color="#fff" />
                  ) : null}
                </TouchableOpacity>
              </View>

              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                  setModalVisible(!isModalVisible);
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.header}>
                      <Text style={styles.modalTitle}>Selecione uma Playlist</Text>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                      >
                          <FontAwesome6 name="circle-xmark" size={30} color="#fff" />
                      </TouchableOpacity>

                    </View>
                    {playlists.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => addToPlaylist(item.id)}>
                        <Image
                          style={styles.cardImage}
                          source={{ uri: item.foto || 'https://starting-music-artista.vercel.app/img-placeholder.png' }}
                          resizeMode="cover"
                        />
                        <Text style={styles.title}>{item.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
      </LinearGradient>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#202238' },
  backButton: { padding: 10, margin: 10 },
  noSongContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  albumArt: {
    width: 270,
    height: 270,
    marginTop: -30,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: 5
  },
  title: {
    marginLeft: 7,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: MyTheme.colors.secondary,
    borderRadius: 5,
  },
  songTitle: { fontSize: 24, color: "#fff", fontWeight: "bold", marginTop: 20 },
  artistName: { fontSize: 18, color: "#aaa" },
  progressBar: { width: "80%", marginTop: 20 },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 5,
  },
  timeLabel: { color: "#fff" },
  addContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: "75%",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'center',
    width: "80%",
    marginTop: 20,
    boxSizing: 'border-box'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalView: {
    backgroundColor: MyTheme.colors.card,
    borderRadius: 20,
    padding: 35,
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
    color: '#fff',
    marginRight: 10
  },
  playlistItem: {
    backgroundColor: '#292938',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
  },
  playlistText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MusicPlayerScreen;

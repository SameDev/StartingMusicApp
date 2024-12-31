import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import { FontAwesome6, MaterialIcons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { usePlayer } from "@/components/PlayerProvider";
import { runOnJS } from 'react-native-reanimated';
import { useThemeColor } from "@/hooks/useThemeColor";
import { RepeatMode } from "react-native-track-player";

type RootStackParamList = {
  Search: undefined;
  HomeScreen: undefined;
  MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MusicPlayer">;

const MusicPlayerScreen: React.FC = () => {
  const MyTheme = useThemeColor;

  const {
    currentSong,
    isPlaying,
    handlePlayPause,
    progress,
    duration,
    position,
    handleSeek,
    setIsPlayerVisible,
    playNext,
    playPrevious,
    toggleRepeatMode,
    repeatMode,
    toggleShuffle,
    isShuffled,
    isLiked,
    handleLike,
    isLoading,
    setLoading 
  } = usePlayer();
  const navigation = useNavigation<NavigationProp>();



  const [songInfo, setSongInfo] = useState({
    name: '',
    artist: '',
    imageUrl: 'https://starting-music-artista.vercel.app/img-placeholder.png',
    duration: '' as unknown as number
  });

  useEffect(() => {
    setIsPlayerVisible(true);

    if (currentSong) {
      setLoading(true)
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
                  <TouchableOpacity onPress={playNext}>
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
                    <FontAwesome6 name="shuffle" size={30} color={isShuffled ? '#fff' : "#d9d9d9" } />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={playPrevious}>
                    <FontAwesome6 name="backward-step" size={30} color="#fff" />
                  </TouchableOpacity>

                  <TouchableWithoutFeedback
                    onPress={() => handlePlayPause()}
                  >
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
});

export default MusicPlayerScreen;

import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import { FontAwesome6, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { usePlayer } from "@/components/PlayerProvider";
import { runOnJS } from 'react-native-reanimated';
import { useThemeColor } from "@/hooks/useThemeColor";

type RootStackParamList = {
  Search: undefined;
  HomeScreen: undefined;
  MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MusicPlayer">;

const MusicPlayerScreen: React.FC = () => {
  const MyTheme = useThemeColor;
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true)
      setSongInfo({
        name: currentSong.nome || 'Título indisponível',
        artist: currentSong.artista || 'Artista desconhecido',
        imageUrl: currentSong.image_url || 'https://starting-music-artista.vercel.app/img-placeholder.png',
        duration
      });
      setIsLoading(false);
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
      <View style={styles.mainContainer}>
        <LinearGradient style={styles.mainContainer} colors={["#2B2641", "#2B2641"]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
              setIsPlayerVisible(false);
            }}
          >
            <FontAwesome6 name="arrow-left" size={24} color="#fff" />
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
                  <TouchableOpacity onPress={playNext}>
                    <FontAwesome6 name="heart" size={30} color="#fff" />
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
                  <TouchableOpacity onPress={playNext}>
                    <FontAwesome6 name="shuffle" size={30} color="#fff" />
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
                  <TouchableOpacity onPress={playNext}>
                    <FontAwesome6 name="repeat" size={30} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View>
                  <Text>A Seguir</Text>
                </View>
              </>
            )}
          </View>
        </LinearGradient>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#202238' },
  backButton: { padding: 10, margin: 10 },
  noSongContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  albumArt: { width: 250, height: 250, borderRadius: 15, marginBottom: 15 },
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

import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePlayer } from "@/components/PlayerProvider";

type RootStackParamList = {
  Search: undefined;
  HomeScreen: undefined;
  MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MusicPlayer"
>;

const MusicPlayerScreen = () => {
  const {
    currentSong,
    isPlaying,
    handlePlayPause,
    progress,
    duration,
    position,
    handleSeek,
    setIsPlayerVisible,
  } = usePlayer();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    setIsPlayerVisible(true);
    return () => setIsPlayerVisible(false);
  }, []);

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) {
    return (
      <View style={styles.noSongContainer}>
        <Text style={styles.noSongText}>Nenhuma música selecionada</Text>
      </View>
    );
  }

  

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        style={styles.mainContainer}
        colors={["#2B2641", "#2B264100"]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
            setIsPlayerVisible(false);
          }}
        >
          <FontAwesome6 name="arrow-left-long" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.noSongContainer}>
          <Image
            source={{ uri: currentSong.image_url }}
            style={styles.albumArt}
          />
          <Text style={styles.songTitle}>{currentSong.nome}</Text>
          <Text style={styles.artistName}>{currentSong.artista}</Text>

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
            <TouchableOpacity
              onPress={async () => {
                const newPosition = Math.max(0, position - 10000);
                await handleSeek(newPosition / duration); 
              }}
            >
              <FontAwesome6 name="arrow-rotate-left" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause}>
              <FontAwesome6 name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const newPosition = Math.min(duration, position + 10000)
                await handleSeek(newPosition / duration); 
              }}>
              <FontAwesome6 name="arrow-rotate-right" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, marginTop: 20 },
  backButton: { padding: 10, margin: 10 },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  noSongContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noSongText: { color: "#fff", fontSize: 18 },
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 20,
  },
});

export default MusicPlayerScreen;

import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { Music } from "@/types/apiRef";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications"; // Para expo-notifications
import notifee from '@notifee/react-native'; // Para notifee

type RootStackParamList = {
  Search: undefined;
  MusicPlayer: { song: Music[] };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MusicPlayer">;

const MusicPlayerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { song } = route.params as { song: Music };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [position, setPositon] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      } catch (error) {
        console.error("Erro ao configurar o modo de áudio:", error);
      }
    };

    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Enviar notificação com expo-notifications
  const sendNotificationExpo = async (song: Music) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Now playing: ${song.nome}`,
        body: `Artist: ${song.artista}`,
      },
      trigger: null, // dispara imediatamente
    });
  };

  // Enviar notificação com notifee (com controles de Play/Pause)
  const sendNotificationNotifee = async (song: Music) => {
    await notifee.displayNotification({
      title: `Now playing: ${song.nome}`,
      body: `Artist: ${song.artista}`,
      android: {
        channelId: 'music_channel', // Crie um canal de notificação se necessário
        smallIcon: 'ic_launcher',  // Defina o ícone da notificação
        actions: [
          {
            title: 'Play/Pause',
            pressAction: {
              id: 'play_pause',
              launchActivity: 'com.myapp.musicplayer',  // Defina a ação para reproduzir ou pausar
            },
          },
        ],
      },
    });
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        if (sound) {
          await sound.pauseAsync();
        }
        setIsPlaying(false);
        // Atualizar a notificação usando expo-notifications
        sendNotificationExpo(song);
      } else {
        if (sound) {
          await sound.playAsync();
        } else {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: song.url },
            { shouldPlay: true, isLooping: true }
          );
          setSound(newSound);
          setIsPlaying(true);
          // Enviar notificação com notifee
          sendNotificationNotifee(song);

          newSound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                await newSound.replayAsync();
              }

              if (!isSliding) {
                let progress = 0;
                if (status.durationMillis && status.positionMillis) {
                  progress = status.positionMillis / status.durationMillis;
                  setProgressBarWidth(progress);

                  setPositon(formatTime(status.positionMillis) as any);
                  setRemaining(formatTime(status.durationMillis - status.positionMillis) as any);

                  setDurationMillis(status.durationMillis);
                }
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Error handling playback:", error);
    }
  };

  const handleSliderChange = (value: number) => {
    setIsSliding(true);
    setProgressBarWidth(value);
    setPositon(formatTime(value * durationMillis) as any);
  };

  const handleSliderSlidingComplete = async (value: number) => {
    setIsSliding(false);
    if (sound && durationMillis) {
      const positionMillis = value * durationMillis;
      await sound.setPositionAsync(positionMillis);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        style={styles.mainContainer}
        colors={["#2B2641", "#2B264100"]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Search")}
        >
          <FontAwesome name={"arrow-left"} size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Caixa de Música */}
          <View style={styles.musicBox}>
            <Image source={{ uri: song.image_url }} style={styles.albumArt} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.nome}</Text>
              <Text style={styles.artistName}>{song.artista}</Text>
            </View>
          </View>

          {/* Botões de Controle */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={handlePlayPause}>
              <FontAwesome
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Barra de Progresso */}
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={1}
            value={progressBarWidth}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#aaa"
            thumbTintColor="#fff"
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderSlidingComplete}
          />
          <View style={styles.timeLabels}>
            <Text style={styles.timeLabel}>{position ? position : '00:00'}</Text>
            <Text style={styles.timeLabel}>{remaining ? remaining : song.duracao}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  backButton: {
    padding: 10,
    margin: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  musicBox: {
    alignItems: "center",
    marginBottom: 30,
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  songInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  songTitle: {
    fontSize: 24,
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 18,
    color: "#aaa",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "60%",
    marginTop: 20,
  },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#aaa",
    borderRadius: 2,
    marginTop: 20,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 14,
    color: "#fff",
  },
});

export default MusicPlayerScreen;

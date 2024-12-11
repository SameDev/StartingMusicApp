import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Audio } from "expo-av";
import { Music } from "@/types/apiRef"; // Assumindo que "Music" é um tipo previamente definido

type PlayerContextType = {
  currentSong: Music | null;
  setCurrentSong: (song: Music) => void;
  isPlayerVisible: boolean;
  setIsPlayerVisible: (visible: boolean) => void;
  isPlaying: boolean;
  handlePlayPause: () => Promise<void>;
  progress: number;
  duration: number;
  position: number;
  handleSeek: (value: number) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!currentSong) return;

    const loadAudio = async () => {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.url },
          { shouldPlay: false }
        );
        setSound(newSound);
        setIsPlaying(false);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setProgress((status.positionMillis || 0) / (status.durationMillis || 1));
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      } catch (error) {
        console.error("Erro ao carregar o áudio:", error);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentSong]);

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      const positionMillis = value * duration;
      await sound.setPositionAsync(positionMillis);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlayerVisible,
        setIsPlayerVisible,
        isPlaying,
        handlePlayPause,
        progress,
        duration,
        position,
        handleSeek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

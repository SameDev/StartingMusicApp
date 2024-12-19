import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import TrackPlayer, { 
  Event, 
  useTrackPlayerEvents, 
  State, 
  usePlaybackState, 
  useProgress, 
  Capability, 
  AppKilledPlaybackBehavior,
} from "react-native-track-player";
import PlayerService from "@/services/PlayerService";
import { Music } from "@/types/apiRef";

type PlayerContextType = {
  currentSong: Music | null;
  setCurrentSong: (song: Music) => Promise<void>;
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

const setupPlayer = async (): Promise<void> => {
  await TrackPlayer.setupPlayer({ waitForBuffer: true });

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
  });
};

export const PlayerProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [currentSong, setCurrentSongState] = useState<Music | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const isPlaying = playbackState === (State.Playing as any);

  const setCurrentSong = async (song: Music): Promise<void> => {
    setCurrentSongState(song);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: song.id,
      url: song.url,
      title: song.nome,
      artist: song.artista,
      artwork: song.image_url,
    });
    await TrackPlayer.play();
  };

  
  useEffect(() => {
    PlayerService.setupPlayer();
    PlayerService.registerEvents();
  }, []);
  const handlePlayPause = async () => {
    const state = await PlayerService.getPlayerState();
    if (state === State.Playing) {
      console.log('a')
      await PlayerService.pause();
    } else {
      console.log('b')
      await PlayerService.play();
    }
  };


  const handleSeek = async (value: number): Promise<void> => {
    const positionMillis = value * duration;
    await TrackPlayer.seekTo(positionMillis);
  };

  useEffect(() => {
    setupPlayer().catch(console.error);
  }, []);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track === null) {
      setCurrentSongState(null);
    }
  });

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlayerVisible,
        setIsPlayerVisible,
        isPlaying,
        handlePlayPause,
        progress: position / (duration || 1),
        duration,
        position,
        handleSeek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import PlayerService from "@/services/PlayerService";
import { Music } from "@/types/apiRef";

type PlayerContextType = {
  currentSong: Music | null;
  setCurrentSong: (song: Music) => Promise<void>;
  playlist: Music[];
  setPlaylist: (songs: Music[]) => Promise<void>;
  clearPlaylist: () => void;
  isPlayerVisible: boolean;
  setIsPlayerVisible: (visible: boolean) => void;
  isPlaying: boolean;
  handlePlayPause: () => Promise<void>;
  progress: number;
  duration: number;
  position: number;
  handleSeek: (value: number) => Promise<void>;
  onPlaybackQueueEnded: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [currentSong, setCurrentSongState] = useState<Music | null>(null);
  const [playlist, setPlaylistState] = useState<Music[]>([]);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

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
  };

  const setPlaylist = async (songs: Music[]): Promise<void> => {
    setPlaylistState(songs);
    await TrackPlayer.reset();
    const tracks = songs.map((song) => ({
      id: song.id,
      url: song.url,
      title: song.nome,
      artist: song.artista,
      artwork: song.image_url,
    }));
    await TrackPlayer.add(tracks);
  };

  const clearPlaylist = (): void => {
    setPlaylistState([]);
    TrackPlayer.reset();
  };

  const playNext = async (): Promise<void> => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.warn("Não há próxima faixa na lista de reprodução.", error);
    }
  };

  const playPrevious = async (): Promise<void> => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.warn("Não há faixa anterior na lista de reprodução.", error);
    }
  };

  const handlePlayPause = async (): Promise<void> => {
    if (playbackState.state === State.Playing) {
      await PlayerService.pause();
    } else {
      await PlayerService.play();
    }
  };

  const handleSeek = async (value: number): Promise<void> => {
    const positionMillis = value * duration;
    await TrackPlayer.seekTo(positionMillis);
  };

  const onPlaybackQueueEnded = (): void => {
    console.log('A lista de reprodução terminou.');
    setCurrentSongState(null);
    setIsPlayerVisible(false);
  };

  useEffect(() => {
    if (!isPlayerInitialized) {
      PlayerService.setupPlayer().catch(console.error);
      PlayerService.registerEvents();
      setIsPlayerInitialized(true);
    }
  }, [isPlayerInitialized]);

  useTrackPlayerEvents([
    Event.PlaybackActiveTrackChanged,
    Event.PlaybackQueueEnded
  ], async (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      onPlaybackQueueEnded();
    } else if (event.type === Event.PlaybackActiveTrackChanged) {
      if (event.track === null) {
        setCurrentSongState(null);
      }
    }
  });

  useEffect(() => {
    const syncCurrentSong = async () => {
      try {
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          setCurrentSongState({
            id: track.id as string,
            url: track.url as string,
            nome: track.title as string,
            artista: track.artist as string,
            image_url: track.artwork as string,
          });
        } else {
          setCurrentSongState(null);
        }
      } catch (error) {
        console.error("Erro ao sincronizar música atual:", error);
      }
    };
  
    const interval = setInterval(syncCurrentSong, 1000);
  
    return () => clearInterval(interval);
  }, []);  

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        playlist,
        setPlaylist,
        clearPlaylist,
        isPlayerVisible,
        setIsPlayerVisible,
        isPlaying: playbackState.state === State.Playing,
        handlePlayPause,
        progress: position / (duration || 1),
        duration,
        position,
        handleSeek,
        onPlaybackQueueEnded,
        playNext,
        playPrevious
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

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  State,
  usePlaybackState,
  useProgress,
  RepeatMode,
} from "react-native-track-player";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
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
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLiked: boolean;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  handleLike: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [currentSong, setCurrentSongState] = useState<Music | null>(null);
  const [playlist, setPlaylistState] = useState<Music[]>([]);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const [userData, setUserData] = useState<any>(null);
  const [jwtToken, setJwtToken] = useState<string>("");
  const [isLogged, setLogged] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const user = await AsyncStorage.getItem("userData");
      if (token && user) {
        setJwtToken(token);
        setUserData(JSON.parse(user));
        setLogged(true);
      } else {
        Alert.alert("Erro", "Usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao recuperar dados do AsyncStorage:", error);
      Alert.alert("Erro", "Falha ao recuperar os dados do usuário.");
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLike = async (): Promise<void> => {
    if (!currentSong) return;

    try {
      const endpoint = isLiked
        ? `https://starting-music.onrender.com/user/remove/like/${userData.id}`
        : `https://starting-music.onrender.com/user/add/like/${userData.id}`;

      const response = await axios.post(
        endpoint,
        { musicas: [currentSong.id] },
        { headers: { Authorization: jwtToken } }
      );

      if (response.status === 201) {
        setIsLiked(!isLiked);
      } else {
        console.warn("Resposta inesperada do servidor:", response.data);
      }
    } catch (error) {
      console.error("Erro ao curtir a música:", error);
    }
  };

  const toggleRepeatMode = async (): Promise<void> => {
    try {
      const newRepeatMode =
        repeatMode === RepeatMode.Off
          ? RepeatMode.Queue
          : repeatMode === RepeatMode.Queue
            ? RepeatMode.Track
            : RepeatMode.Off;

      await TrackPlayer.setRepeatMode(newRepeatMode);
      setRepeatMode(newRepeatMode);
    } catch (error) {
      console.error("Erro ao alternar o modo de repetição:", error);
    }
  };

  const toggleShuffle = async (): Promise<void> => {
    try {
      const shuffledPlaylist = isShuffled
        ? [...playlist].sort((a, b) => Number(a.id) - Number(b.id))
        : [...playlist].sort(() => Math.random() - 0.5); 

      setPlaylistState(shuffledPlaylist);
      setIsShuffled(!isShuffled);
    } catch (error) {
      console.error("Erro ao alternar shuffle:", error);
    }
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
      setLoading(true);
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.warn("Não há próxima faixa na lista de reprodução.", error);
    }
  };
  const playPrevious = async (): Promise<void> => {
    try {
      setLoading(true);
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.warn("Não há faixa anterior na lista de reprodução.", error);
    }
  };

  const setCurrentSong = async (song: Music): Promise<void> => {
    if (!song) return;
    setLoading(true);

    try {
      clearPlaylist();

      if (!isLogged) {
        await loadUserData();
        if (!userData || !jwtToken) {
          console.warn("Usuário não está logado ou dados insuficientes.");
          return;
        }
      }

      setCurrentSongState(song);

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.id,
        url: song.url,
        title: song.nome,
        artist: song.artista,
        artwork: song.image_url,
      });

      const response = await axios.post(
        "https://starting-music.onrender.com/views/create",
        { userId: userData.id, songId: song.id, data: new Date().toISOString() },
        { headers: { Authorization: jwtToken } }
      );

      setLoading(false);
      setIsLiked(response.data.usuarioGostou);
    } catch (error) {
      console.error("Erro ao configurar a música atual:", error);
      setLoading(false);
    }
  };

  const handlePlayPause = async (): Promise<void> => {
    try {
      if (playbackState.state === State.Playing) {
        await PlayerService.pause();
      } else {
        await PlayerService.play();
      }
    } catch (error) {
      console.error("Erro ao alternar play/pause:", error);
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
    const initPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        setIsPlayerInitialized(true);
      } catch (error) {
        console.error("Erro ao inicializar o player:", error);
      }
    };
    if (!isPlayerInitialized) {
      initPlayer();
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
        playPrevious,
        toggleRepeatMode,
        toggleShuffle,
        repeatMode,
        isShuffled,
        isLiked,
        handleLike,
        isLoading,
        setLoading,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer deve ser usado dentro de um PlayerProvider");
  }
  return context;
};

import { Linking } from "react-native";
import TrackPlayer, { 
  Track, 
  Event, 
  State, 
  Capability, 
  AppKilledPlaybackBehavior
} from "react-native-track-player";

export class PlayerService {
  static async setupPlayer(): Promise<void> {
    try {
      await TrackPlayer.setupPlayer({ waitForBuffer: true });
      
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
    } catch (error) {
      console.error("Erro ao configurar o player:", error);
    }
  }

  static async addTrack(track: Track): Promise<void> {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
    } catch (error) {
      console.error("Erro ao adicionar faixa:", error);
    }
  }

  static async play(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error("Erro ao iniciar reprodução:", error);
    }
  }

  static async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error("Erro ao pausar reprodução:", error);
    }
  }

  static async stop(): Promise<void> {
    try {
      await TrackPlayer.stop();
    } catch (error) {
      console.error("Erro ao parar reprodução:", error);
    }
  }

  static async playNext(): Promise<void> {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.warn("Não há próxima faixa na lista de reprodução.", error);
    }
  }

  static async playPrevious (): Promise<void> {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.warn("Não há faixa anterior na lista de reprodução.", error);
    }
  };

  static async seekTo(seconds: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(seconds);
    } catch (error) {
      console.error("Erro ao buscar posição:", error);
    }
  }

  static async getPlayerState(): Promise<State> {
    try {
      return await TrackPlayer.getState();
    } catch (error) {
      console.error("Erro ao obter estado do player:", error);
      throw error;
    }
  }

  static registerEvents(): void {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
      try {
        await TrackPlayer.play();
      } catch (error) {
        console.error("Erro ao executar play remoto:", error);
      }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
      try {
        await TrackPlayer.pause();
      } catch (error) {
        console.error("Erro ao executar pause remoto:", error);
      }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
      try {
        await TrackPlayer.stop();
      } catch (error) {
        console.error("Erro ao executar stop remoto:", error);
      }
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
      try {
        await TrackPlayer.skipToNext();
      } catch (error) {
        console.warn("Não há próxima faixa na lista de reprodução.", error);
      }
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
      try {
        await TrackPlayer.skipToPrevious();
      } catch (error) {
        console.warn("Não há faixa anterior na lista de reprodução.", error);
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (data) => {
      if (data.position > 0) {
        console.log("Fila de reprodução concluída");
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error("Erro de reprodução:", error);
    });
    TrackPlayer.addEventListener(Event.RemoteDuck, async () => {
      const deepLink = 'startingmusic://MusicPlayerScreen';
      Linking.openURL(deepLink);
    });
  }
}

export default PlayerService;

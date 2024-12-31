import Slider from '@react-native-community/slider';
import { View, StyleSheet, Image, Linking, TouchableOpacity, Text } from 'react-native';
import { usePlayer } from './PlayerProvider';
import { FontAwesome6 } from '@expo/vector-icons';



export const Miniplayer = (navigation: { navigate: (arg0: string) => void; }) => {
    const { currentSong, isPlaying, handlePlayPause, progress } = usePlayer();
    return (
        <View style={{backgroundColor: '#12121F'}}>
            <View style={styles.minimizedPlayerContainer}>
                <TouchableOpacity
                    style={styles.minimizedPlayer}
                    onPress={() => navigation.navigate('MusicPlayer')}
                >
                    <Image
                        source={{ uri: currentSong?.image_url }}
                        style={styles.albumArt}
                    />
                    <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>{currentSong?.nome || 'Nenhuma Música Tocando'}</Text>
                        <Text style={styles.songArtist}>{currentSong?.artista || ''}</Text>
                    </View>
                    <TouchableOpacity onPress={handlePlayPause}>
                        <FontAwesome6
                            name={isPlaying ? 'pause' : 'play'}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
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
                disabled={true}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    minimizedPlayerContainer: {
        width: '100%',
        justifyContent: 'center',
        paddingTop: 10,
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    minimizedPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: { width: '100%'},
    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    songInfo: {
        flex: 1,
        marginLeft: 10,
    },
    songTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    songArtist: {
        color: '#ccc',
        fontSize: 12,
    },
})
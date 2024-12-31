import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Album, Music, User } from '@/types/apiRef';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { usePlayer } from '@/components/PlayerProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColor } from '@/hooks/useThemeColor';

type RootStackParamList = {
    Search: undefined;
    MusicPlayer: any;
    Artista: { artista: User[] };
    AlbumScreen: { album: Album };
    Playlist: { playlist: [] };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AlbumScreen'>;
type AlbumRouteProp = RouteProp<RootStackParamList, 'AlbumScreen'>;

const MyTheme = useThemeColor;

const AlbumScreen = ({ navigation }: { navigation: NavigationProp }) => {
    const route = useRoute<AlbumRouteProp>();
    const { album } = route.params as unknown as { album: Album };
    const { setCurrentSong, clearPlaylist, setPlaylist } = usePlayer();
    const musicas = album.musicas || [];

    const data_lanc = new Date(album.data_lanc);

    const handleSongPress = async (song: Music) => {
        try {
            clearPlaylist()
            await setPlaylist(musicas);
            await setCurrentSong(song);
            navigation.navigate('MusicPlayer');
        } catch (error) {
            console.error('Error handling song press:', error);
        }
    };

    

    const renderMusicItem = (item: Music, index: number) => (
        <View style={styles.musicItem} key={`item-${item.id}`} onTouchEnd={() => handleSongPress(item)}>
            <Image source={{ uri: item.image_url }} style={styles.musicImage} />
            <View style={styles.musicInfo}>
                <Text style={styles.musicName}>{item.nome}</Text>
                <Text style={styles.musicArtist}>
                    {item.artista} • {item.duracao}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleSongPress(item)}>
                <FontAwesome name={"play"} size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={{ backgroundColor: '#12121F', paddingHorizontal: 20, paddingTop: 20 }}>
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left-long" color="#fff" size={30} />
                </TouchableWithoutFeedback>
            </View>
            <View style={styles.headerContainer}>
                <Image source={{ uri: album.image_url }} style={styles.albumImage} resizeMode='cover' />
                <View style={styles.albumInfo}>
                    <Text style={styles.albumLanc}>{album.lancamento}</Text>
                    <Text style={styles.albumTitle}>{album.nome}</Text>
                    <Text style={styles.albumDetails}>
                        <Text style={styles.musicArtist}>{album.artista}</Text> • {data_lanc.getFullYear()} • {musicas.length} músicas
                    </Text>
                    <Text style={styles.albumDescription}>{album.desc}</Text>
                </View>
            </View>

            <View style={styles.containerContent}>
                {musicas.length > 0 ? (
                    musicas.map((item, index) => renderMusicItem(item, index))
                ) : (
                    <Text style={styles.musicName}>Nenhuma música curtida.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MyTheme.colors.background
    },
    containerContent: {
        padding: 20
    },
    headerContainer: {
        backgroundColor: '#12121F',
        width: '100%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        elevation: 5,
        borderBottomRightRadius: 30
    },
    albumLanc: {
        fontWeight: '500',
        color: '#CBCCD1',
    },
    albumImage: {
        width: 250,
        height: 250,
        borderRadius: 10,
        marginRight: 15,
        marginBottom: 10
    },
    albumInfo: {
        padding: 10,
        flex: 1,
        justifyContent: 'center',
    },
    albumTitle: {
        fontSize: 27,
        fontWeight: '900',
        color: '#CBCCD1',
    },
    albumDetails: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 10
    },
    albumDescription: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 10
    },
    musicList: {
        marginTop: 10,
    },
    musicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d2d44',
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
    },
    musicImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    musicInfo: {
        flex: 1,
    },
    musicName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    musicArtist: {
        fontSize: 14,
        color: '#ccc',
        fontWeight: 'bold'
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#444',
        borderRadius: 5,
        padding: 5,
        marginLeft: 5,
    },
    actionText: {
        fontSize: 12,
        color: '#fff',
    },
});

export default AlbumScreen;

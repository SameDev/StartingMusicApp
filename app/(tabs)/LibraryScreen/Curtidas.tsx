import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Alert, RefreshControl } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { Music, User } from '@/types/apiRef';
import { usePlayer } from '@/components/PlayerProvider';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyTheme = useThemeColor;

type RootStackParamList = {
    LibraryScreen: undefined;
    Curtidas: undefined;
    MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Curtidas'>;

const Curtidas = ({ navigation }: { navigation: NavigationProp }) => {
    const [userData, setUserData] = useState<User>({} as User);
    const [likedSongs, setLikedSongs] = useState<Music[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { setCurrentSong, setPlaylist } = usePlayer();
    const [jwtToken, setToken] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserData = await AsyncStorage.getItem('userData');
            const storedJwt = await AsyncStorage.getItem('jwtToken') || '';
            setToken(storedJwt);

            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                setUserData(user);
            }
        };
        loadUserData();
    }, []);

    const fetchLikedSongs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://starting-music.onrender.com/user/songs/liked/6');
            setLikedSongs(response.data);
        } catch (error) {
            console.error("Erro ao buscar músicas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedSongs();
    }, []);
    const handleRemoveLikedSong = async (songId: string) => {
        try {
            const response = await axios.post(
                `https://starting-music.onrender.com/user/remove/like/${userData.id}`,
                { musicas: [songId] }, 
                {
                    headers: {
                        Authorization: `${jwtToken}`, 
                    },
                }
            );
    
            if (response.status === 201) {
                setLikedSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
                fetchLikedSongs(); 
            }
        } catch (error) {
            console.error("Erro ao remover música:", error);
        }
    };
    

    const handlePlayAll = () => {
        if (likedSongs.length > 0) {
            setCurrentSong(likedSongs[0]);
            setPlaylist(likedSongs);
            navigation.navigate('MusicPlayer');
        } else {
            Alert.alert('Aviso', 'Nenhuma música disponível para reprodução.');
        }
    };

    const handlePlay = (item: Music) => {
        if (likedSongs.length > 0) {
            setCurrentSong(item);
            setPlaylist(likedSongs);
            navigation.navigate('MusicPlayer');
        } else {
            Alert.alert('Aviso', 'Nenhuma música disponível para reprodução.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLikedSongs();
        setRefreshing(false);
    };

    const renderItem = (item: Music, index: number) => {
        const renderRightActions = () => (
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveLikedSong(item.id)}
            >
                <FontAwesome name="trash" size={30} color="#fff" />
            </TouchableOpacity>
        );

        return (
            <Swipeable key={index} renderRightActions={renderRightActions}>
                <TouchableOpacity style={styles.item} onPress={() => handlePlay(item)}>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.nome}</Text>
                        <Text style={styles.artist}>{item.artista}</Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <ScrollView
            contentContainerStyle={styles.list}
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={{ backgroundColor: '#12121F', paddingHorizontal: 20, paddingTop: 20 }}>
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left-long" color="#fff" size={30} />
                </TouchableWithoutFeedback>
            </View>
            <View style={styles.headerContainer}>
                <View style={styles.card}>
                    <FontAwesome name="heart" size={70} color="#fff" />
                </View>
                <Text style={styles.headerTitle}>Suas Curtidas</Text>

                <TouchableWithoutFeedback onPress={handlePlayAll}>
                    <View style={{
                        backgroundColor: '#fff',
                        width: 42,
                        height: 42,
                        borderRadius: 22,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10
                    }}>
                        <MaterialIcons
                            style={{
                                width: 65,
                                height: 65,
                            }}
                            size={65}
                            name="play-circle-filled"
                            color={MyTheme.colors.primary}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Carregando suas músicas...</Text>
            ) : (
                <View>
                    {likedSongs.length > 0 ? (
                        likedSongs.map((item, index) => renderItem(item, index))
                    ) : (
                        <Text style={styles.loadingText}>Nenhuma música curtida.</Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: MyTheme.colors.background,
        flex: 1,
    },
    card: {
        padding: 10,
        backgroundColor: '#d1c4e9',
        borderRadius: 13,
        width: '50%',
        height: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    headerContainer: {
        backgroundColor: '#12121F',
        width: '100%',
        padding: 10,
        height: 330,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        padding: 6,
        backgroundColor: MyTheme.colors.secondary,
        borderRadius: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    artist: {
        color: '#888',
        fontSize: 14,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    list: {
        paddingBottom: 16,
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        width: 80,
        borderRadius: 10,
        marginTop: 10,
        marginRight: 10,
    },
});

export default Curtidas;

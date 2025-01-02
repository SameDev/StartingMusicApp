import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Alert, Modal, Button, TextInput, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { Music } from '@/types/apiRef';
import { usePlayer } from '@/components/PlayerProvider';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

import { FireRef, getDownloadURL, storage, uploadBytes } from '@/composables/firebase';
import { useForm } from 'react-hook-form';

const MyTheme = useThemeColor;

type RootStackParamList = {
    LibraryScreen: undefined;
    PlaylistScreen: undefined;
    MusicPlayer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlaylistScreen'>;

type PlaylistScreenProps = {
    route: {
        params: {
            id: string;
            nome: string;
            descricao: string;
            musicas: Music[];
            foto: string;
        };
    };
    navigation: NavigationProp;
};

const Playlist = ({ route, navigation }: PlaylistScreenProps) => {
    const { control, handleSubmit, formState: { errors }, setValue } = useForm();
    const { id, nome, descricao, musicas, foto } = route.params;
    const [songs, setSongs] = useState<Music[]>([]);
    const [loading, setLoading] = useState(true);
    const { setCurrentSong, setPlaylist } = usePlayer();
    const [jwtToken, setJwtToken] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(nome);
    const [newDescription, setNewDescription] = useState(descricao);
    const [newPhoto, setNewPhoto] = useState('');

    useEffect(() => {
        const loadToken = async () => {
            const token = await AsyncStorage.getItem('jwtToken') || '';
            setJwtToken(token);
        };
        loadToken();
    }, []);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setSongs(musicas);
            } catch (error) {
                console.error("Erro ao buscar músicas da playlist:", error);
            } finally {
                setLoading(false);
            }
        };
        if (jwtToken) fetchSongs();
        setNewPhoto(foto || 'https://starting-music-artista.vercel.app/img-placeholder.png')
    }, [jwtToken, id]);

    const handleRemoveSong = (songId: string) => {
        axios
            .delete(`https://starting-music.onrender.com/playlist/delete/song/${id}`, {
                headers: { Authorization: `${jwtToken}` },
                data: { musicas: [songId] }
            })
            .then(() => {
                setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
            })
            .catch((error) => {
                console.error("Erro ao remover música da playlist:", error);
            });
    };
    

    const renderItem = (item: Music, index: number) => {
        const renderRightActions = () => (
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveSong(item.id)}
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

    const handlePlayAll = () => {
        if (songs.length > 0) {
            setCurrentSong(songs[0]);
            setPlaylist(songs);
            navigation.navigate('MusicPlayer');
        } else {
            Alert.alert('Aviso', 'Nenhuma música disponível para reprodução.');
        }
    };

    const handlePlay = (item: Music) => {
        setCurrentSong(item);
        setPlaylist(songs);
        navigation.navigate('MusicPlayer');
    };

    const handleDrag = (event: any) => {
        const { translationY } = event.nativeEvent;
        if (translationY > 150) {
            setIsEditing(false);
        }
    };

    const handleImageUpload = async (type: 'imageUrl') => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          quality: 1,
          aspect: [4, 3]
        });
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const selectedUri = result.assets[0].uri;
          setNewPhoto(selectedUri);
          setValue(type, selectedUri);
        }
      };
    
    
    const uploadImage = async (uri: string, folder: string) => {
        const imageRef = FireRef(storage, `${folder}/${Date.now()}`);
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageSnapshot = await uploadBytes(imageRef, blob);
        return getDownloadURL(imageSnapshot.ref);
    };


    const handleUpdatePlaylist = async () => {
        try {
            let updatedPhotoUrl = newPhoto;
            if (newPhoto !== foto) {
                updatedPhotoUrl = await uploadImage(newPhoto, 'images');
            }

            const response = await axios.post(
                `https://starting-music.onrender.com/playlist/update/${id}`,
                {
                    nome: newName,
                    descricao: newDescription,
                    foto: updatedPhotoUrl,
                },
                {
                    headers: { Authorization: `${jwtToken}` },
                }
            );

            if (response.status === 201) {
                Alert.alert('Sucesso', 'Playlist atualizada com sucesso!');
                setIsEditing(false);
                navigation.navigate('LibraryScreen');
            } else {
                Alert.alert('Erro', 'Não foi possível atualizar a playlist.');
            }
        } catch (error) {
            console.error('Erro ao atualizar a playlist:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar atualizar a playlist.');
        }
    };

    const handleDeletePlaylist = async () => {
        try {
            const response = await axios.delete(
            `https://starting-music.onrender.com/playlist/delete/${id}`,
            { headers: { Authorization: `${jwtToken}` },}
            )

            if (response.status == 200) {
                Alert.alert('Sucesso', 'Playlist deletada!');
                setIsEditing(false);
                navigation.navigate('LibraryScreen');
            } else {
                Alert.alert('Erro', 'Não foi possível atualizar a playlist.');
            }
        }
        catch (error) {
            console.log(error)
            Alert.alert("Erro", 'Não foi possível deletar a playlist')
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.list} style={styles.container}>
            <Modal visible={isEditing} animationType="slide" transparent={true}>
                <PanGestureHandler onGestureEvent={handleDrag}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Editar Playlist</Text>

                            <TouchableOpacity onPress={() => handleImageUpload('imageUrl')}>
                                <Image
                                    source={{ uri: newPhoto }}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Novo nome"
                                value={newName}
                                onChangeText={setNewName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Nova descrição"
                                value={newDescription}
                                onChangeText={setNewDescription}
                            />
                            

                            <View style={styles.modalButtons}>
                                <Pressable style={[styles.button, styles.buttonClose]} onPress={handleUpdatePlaylist}>
                                    <Text style={styles.textStyle}>Editar a Playlist</Text>
                                </Pressable>
                                <Pressable style={[styles.button, styles.buttonCancel]} onPress={() => setIsEditing(false)}>
                                    <Text style={styles.textStyle}>Cancelar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </PanGestureHandler>
            </Modal>

            <View style={{ backgroundColor: '#12121F', paddingHorizontal: 20, paddingTop: 20 }}>
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left-long" color="#fff" size={30} />
                </TouchableWithoutFeedback>
            </View>

            <View style={styles.headerContainer}>
                <Image style={styles.card} source={{ uri: newPhoto }} resizeMode='cover' />
                <Text style={styles.headerTitle}>{nome}</Text>
                <Text style={styles.description}>{descricao}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => handleDeletePlaylist()}>
                        <View style={{
                            backgroundColor: '#E64575',
                            width: 42,
                            height: 42,
                            borderRadius: 22,
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                            <FontAwesome6 name="trash" color='#FFF' size={20} />
                        </View>
                    </TouchableOpacity>
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
                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setIsEditing(true)}>
                        <View style={{
                            backgroundColor: '#fff',
                            width: 42,
                            height: 42,
                            borderRadius: 22,
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                            <FontAwesome6 name="pen" color={MyTheme.colors.secondary} size={20} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Carregando músicas...</Text>
            ) : (
                <View>
                    {songs.length > 0 ? (
                        songs.map((item, index) => renderItem(item, index))
                    ) : (
                        <Text style={styles.loadingText}>Nenhuma música na playlist.</Text>
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
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        backgroundColor: MyTheme.colors.card,
        borderRadius: 20,
        padding: 35,
        paddingVertical: 100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#FFF',
        marginBottom: 10,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    description: {
        color: '#888',
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#fff'
    },
    input: {
        width: 350,
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderRadius: 8,
        color: '#fff',
        borderColor: MyTheme.colors.border,
        backgroundColor: MyTheme.colors.accent,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        width: '48%',
    },
    buttonClose: {
        backgroundColor: MyTheme.colors.primary,
    },
    buttonCancel: {
        backgroundColor: '#E64575',
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
        padding: 30,
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

export default Playlist;

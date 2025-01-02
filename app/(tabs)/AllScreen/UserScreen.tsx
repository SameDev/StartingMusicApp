import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome6 } from '@expo/vector-icons';
import { Album, User } from '@/types/apiRef';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FireRef, getDownloadURL, storage, uploadBytes } from '@/composables/firebase';
import axios from 'axios';

const MyTheme = useThemeColor;

const PLACEHOLDER_ARTIST_IMAGE = 'https://starting-music-artista.vercel.app/user-placeholder.jpeg';
const PLACEHOLDER_BANNER_IMAGE = 'https://starting-music-artista.vercel.app/banner.png';

type RootStackParamList = {
  Search: undefined;
  MusicPlayer: any;
  Artista: { artista: User[] };
  AlbumScreen: { album: Album };
  Playlist: { playlist: [] };
  UserScreen: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserScreen'>;

const UserScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [userData, setUserData] = useState<User>({} as User);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [jwtToken, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedJwt = await AsyncStorage.getItem('jwtToken') || '';
      setToken(storedJwt)

      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setNewName(user.nome);
        setNewEmail(user.email)
        setProfileImage(user.foto_perfil || PLACEHOLDER_ARTIST_IMAGE);
        setBannerImage(user.banner_perfil || PLACEHOLDER_BANNER_IMAGE);
      }
    };
    loadUserData();
  }, []);

  const handleImagePick = async (type: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      type === 'profile' ? setProfileImage(uri) : setBannerImage(uri);
      Alert.alert('Imagem alterada com sucesso!');
    }
  };

  const uploadImage = async (uri: string, folder: string) => {
    const imageRef = FireRef(storage, `${folder}/${Date.now()}`);
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageSnapshot = await uploadBytes(imageRef, blob);
    return getDownloadURL(imageSnapshot.ref);
  };


  const handleSaveChanges = async () => {
    if (!newName.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      setIsLoading(true);

      let profileImageUrl = profileImage;
      let bannerImageUrl = bannerImage;

      if (profileImage !== userData.foto_perfil) {
        profileImageUrl = await uploadImage(profileImage, 'images');
      } else if (bannerImage !== userData.banner_perfil) {
        bannerImageUrl = await uploadImage(bannerImage, 'banners');
      }

      const payload = {
        nome: newName,
        descricao: userData.desc,
        url: profileImageUrl,
        email: userData.email,
        banner: bannerImageUrl,
        data_nasc: userData.data_nasc,
      };


      const response = await axios.post(
        `https://starting-music.onrender.com/user/update/${userData.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: jwtToken || '',
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data;
        setUserData(updatedUser.user);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser.user));
        Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      } else {
        console.log('Erro na resposta do servidor:', response.data);
        throw new Error('Erro ao salvar alterações');
      }
    } catch (error) {
      console.error('Erro na solicitação de rede:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('jwtToken');

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={{ uri: bannerImage }} style={styles.bannerImage}>
        <View style={styles.overlay} />

        <View style={{ position: 'absolute', top: 40, left: 20 }}>
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <FontAwesome6 name="arrow-left-long" color="#fff" size={30} />
          </TouchableWithoutFeedback>
        </View>

        <TouchableOpacity
          style={styles.changeBannerButton}
          onPress={() => handleImagePick('banner')}
        >
          <Text style={styles.changeBannerText}>Alterar Banner</Text>
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => handleImagePick('profile')}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.label}>Seu nome:</Text>
        <TextInput
          style={styles.nameInput}
          value={newName}
          onChangeText={setNewName}
          placeholder="Digite seu nome"
          placeholderTextColor="#A0A0A0"
        />
        <Text style={styles.label}>Seu email:</Text>
        <TextInput
          style={styles.nameInput}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="Digite seu nome"
          placeholderTextColor="#A0A0A0"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        {isLoading ? (
          <ActivityIndicator color='#fff' size={20} />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MyTheme.colors.background,
    flex: 1,
  },
  label: {
    color: '#fff',
    alignSelf: 'flex-start',
    marginLeft: 45,
    marginTop: 10,
    marginBottom: -10,
    fontSize: 16
  },
  bannerImage: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  changeBannerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  changeBannerText: {
    color: '#FFF',
    fontSize: 14,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
    elevation: 10
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: 10,
  },
  nameInput: {
    width: '80%',
    height: 50,
    borderColor: MyTheme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 15,
    backgroundColor: MyTheme.colors.accent,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: MyTheme.colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center'
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#E64575',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserScreen;

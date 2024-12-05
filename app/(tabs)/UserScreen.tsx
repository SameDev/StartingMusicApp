import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const UserScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setNewName(user.nome);
        setProfileImage(user.foto_perfil);
      }
    };
    loadUserData();
  }, []);

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Alert.alert('Foto alterada com sucesso!');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedUserData = { ...userData, nome: newName, foto_perfil: profileImage };
      setUserData(updatedUserData);

      // Salva no AsyncStorage (ou envia para o backend, caso necessário)
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      Alert.alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Image
              source={{ uri: profileImage || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.nameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Digite seu nome"
            placeholderTextColor="#A0A0A0"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.loadingText}>Carregando...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E2C',
    padding: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  nameInput: {
    height: 50,
    width: '80%',
    borderColor: '#292938',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#292938',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default UserScreen;

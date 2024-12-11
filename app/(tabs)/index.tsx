import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome6 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import LibraryScreen from './LibraryScreen';
import UserScreen from './UserScreen';
import MusicPlayerScreen from './MusicPlayerScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PlayerProvider, usePlayer } from '@/components/PlayerProvider';

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type TabParamList = {
  Home: undefined;
  Pesquisar: undefined;
  Biblioteca: undefined;
  Usuario: undefined;
};

type AppParamList = {
  MainTabs: undefined;
  MusicPlayer: undefined;
} & TabParamList;

import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';

type MainTabsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<AppParamList>
>;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ navigation }: { navigation: MainTabsNavigationProp }) {
  const [userPhoto, setUserPhoto] = useState(null);
  const { 
    isPlayerVisible, 
    currentSong, 
    isPlaying, 
    handlePlayPause,
    progress } = usePlayer();

  const MyTheme = useThemeColor;

  useEffect(() => {
    const fetchUserPhoto = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserPhoto(userData.foto_perfil);
      }
    };

    fetchUserPhoto();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => {
            if (route.name === 'Usuario') {
              return userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.userImage} />
              ) : (
                <FontAwesome6 name="circle-user" size={28} color={color} />
              );
            }

            const iconName =
              route.name === 'Home'
                ? 'house'
                : route.name === 'Pesquisar'
                ? 'magnifying-glass'
                : 'bars';

            return <FontAwesome6 name={iconName} size={28} color={color} />;
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: {
            backgroundColor: MyTheme.colors.card,
            height: 90,
            paddingBottom: 20,
            paddingTop: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: MyTheme.colors.iconDefault,
          tabBarInactiveTintColor: MyTheme.colors.iconSelect,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Pesquisar" component={SearchScreen} />
        <Tab.Screen name="Biblioteca" component={LibraryScreen} />
        <Tab.Screen name="Usuario" component={UserScreen} />
      </Tab.Navigator>

      {!isPlayerVisible && currentSong && (
      <View style={styles.minimizedPlayerContainer}>
        <TouchableOpacity
          style={styles.minimizedPlayer}
          onPress={() => navigation.navigate('MusicPlayer')}
        >
          <Image
            source={{ uri: currentSong.image_url }}
            style={styles.albumArt}
          />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{currentSong.nome || 'Nenhuma Música Tocando'}</Text>
            <Text style={styles.songArtist}>{currentSong.artista || ''}</Text>
          </View>
          <TouchableOpacity onPress={handlePlayPause}>
            <FontAwesome6
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
              style={styles.playIcon}
            />
          </TouchableOpacity>
          
        </TouchableOpacity>
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
        
      )}
    </View>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="MusicPlayer"
        component={MusicPlayerScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const MyTheme = useThemeColor;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <NavigationContainer theme={MyTheme} independent={true}>
          {isAuthenticated ? (
            <MainStack />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isRegistering ? (
                <Stack.Screen name="Cadastro">
                  {() => (
                    <RegisterScreen
                      onRegister={() => setIsAuthenticated(true)}
                      onBackToLogin={() => setIsRegistering(false)}
                    />
                  )}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Login">
                  {() => (
                    <LoginScreen
                      onLogin={() => setIsAuthenticated(true)}
                      onRegister={() => setIsRegistering(true)}
                    />
                  )}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
  },
  progressBar: { width: "100%" },
  minimizedPlayerContainer: {
    position: 'absolute',
    bottom: 105,
    left: 0,
    right: 0,
    height: 60,
  },
  minimizedPlayer: {
    backgroundColor: '#12121F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    zIndex: 1000,
  },
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
  playIcon: {
    marginLeft: 10,
  },
});

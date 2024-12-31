import React, { useState, useEffect, ReactNode } from 'react';
import { View, StyleSheet, Image, Linking } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome6 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './Home';
import SearchScreen from './SearchScreen';
import MusicPlayerScreen from './MusicPlayerScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PlayerProvider, usePlayer } from '@/components/PlayerProvider';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Miniplayer } from '@/components/Miniplayer';
import Navigation from './LibraryScreen';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type MainTabsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<AppParamList>
>;

function MainTabs({ navigation }: { navigation: MainTabsNavigationProp }) {
  const [userPhoto, setUserPhoto] = useState(null);
  const { isPlayerVisible, currentSong} = usePlayer();
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

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url === 'startingmusic://notification.click') {
        navigation.navigate('MusicPlayer');
      }
    };
  
    const initDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink({ url });
      }
    };
  
    Linking.addEventListener('url', handleDeepLink);
  
    initDeepLink();
  
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);


  return (
    <View style={{ flex: 1, backgroundColor: '#202238', flexDirection: "column" }}>
      <Tab.Navigator
        tabBar={(tabsProps) => {
          return <>
            {!isPlayerVisible && currentSong && (
              <Miniplayer {...navigation} />
              
            )}
            <BottomTabBar {...tabsProps} />
          </>;
        }}
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
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
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
        <Tab.Screen name="Home" children={() => <HomeScreen initialRoute="HomeScreen" />} />
        <Tab.Screen name="Pesquisar" children={() => <HomeScreen initialRoute="SearchScreen" />} />
        <Tab.Screen name="Biblioteca" component={Navigation} />
      </Tab.Navigator>
    </View>
  );
}

function MainStack() {
  const MyTheme = useThemeColor;

  return (
    <View style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
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
    </View>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const MyTheme = useThemeColor;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
      <PlayerProvider>
          <View style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
            {isAuthenticated ? (
              <MainStack/>
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
          </View>
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
});

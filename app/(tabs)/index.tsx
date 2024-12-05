import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome6 } from '@expo/vector-icons';
import { View, Image, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import LibraryScreen from './LibraryScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import AlbumScreen from './AlbumScreen';
import UserScreen from './UserScreen';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const [userPhoto, setUserPhoto] = useState(null);
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
                <Image
                  source={{ uri: userPhoto }}
                  style={[styles.userImage]}
                />
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
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderColor: MyTheme.colors.card,
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
    </View>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const MyTheme = useThemeColor;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={MyTheme} independent={true}>
        {isAuthenticated ? (
          <MainTabs />
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

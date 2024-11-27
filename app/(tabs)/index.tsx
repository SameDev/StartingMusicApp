import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome6 } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import LibraryScreen from './LibraryScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen'; 
import UserScreen from './UserScreen'; 
import { useThemeColor } from '@/hooks/useThemeColor';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const MyTheme = useThemeColor;

  return (
    <View style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => {
            const iconName =
              route.name === 'Home'
                ? 'house'
                : route.name === 'Pesquisar'
                ? 'magnifying-glass'
                : route.name === 'Usuario'
                ? 'circle-user'
                : 'bars'

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
            borderColor: MyTheme.colors.card
          },
          tabBarActiveTintColor: MyTheme.colors.iconSelect,
          tabBarInactiveTintColor: MyTheme.colors.iconDefault,
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

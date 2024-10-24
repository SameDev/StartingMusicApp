import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import LibraryScreen from './LibraryScreen';
import MusicList from './MusicList';
import MusicPlayerScreen from './MusicPlayerScreen';
import { useThemeColor } from '@/hooks/useThemeColor';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MusicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MusicList" component={MusicList} /> 
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} /> 
    </Stack.Navigator>
  );
}

export default function Index() {
  const MyTheme = useThemeColor;

  return (
    <NavigationContainer theme={MyTheme} independent={true}>
      <View style={{ flex: 1, backgroundColor: MyTheme.colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => {
            const iconName = route.name === 'Home' 
              ? 'home' 
              : route.name === 'Pesquisar' 
              ? 'search' 
              : route.name === 'Biblioteca' 
              ? 'menu' 
              : route.name === 'Musica' 
              ? 'music-note' 
              : undefined;

            return <MaterialIcons name={iconName} size={28} color={color} />; 
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12, 
          },
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
            borderTopWidth: 1, 
            borderTopColor: '#ddd',
          },
          tabBarActiveTintColor: MyTheme.colors.iconSelect,
          tabBarInactiveTintColor: MyTheme.colors.iconDefault,
          headerShown: false
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Pesquisar" component={SearchScreen} />
        <Tab.Screen name="Biblioteca" component={LibraryScreen} />
        <Tab.Screen name="Musica" component={MusicStack} />
      </Tab.Navigator>


      </View>
    </NavigationContainer>
  );
}

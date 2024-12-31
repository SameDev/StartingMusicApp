import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './AllScreen/HomeScreen';
import ArtistScreen from './AllScreen/ArtistaScreen';
import AlbumScreen from './AllScreen/AlbumScreen';
import SearchScreen from './SearchScreen';
import UserScreen from './AllScreen/UserScreen';

const Stack = createNativeStackNavigator();

const Home = ({ initialRoute }: { initialRoute: string }) => {
  return (
    <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false, animation: 'fade' }}
    >
        <Stack.Screen 
            name="HomeScreen" 
            component={HomeScreen} 
        />
        <Stack.Screen 
            name="ArtistaScreen" 
            component={ArtistScreen}
        />
        <Stack.Screen 
            name="AlbumScreen" 
            component={AlbumScreen}
        />
        <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
        />
        <Stack.Screen
            name="UserScreen"
            component={UserScreen}
            options={{animation: 'slide_from_bottom'}}
        />
    </Stack.Navigator>
  );
};

export default Home;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from './LibraryScreen/LibraryScreen';
import Curtidas from './LibraryScreen/Curtidas';
import Playlist from './LibraryScreen/PlaylistScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator 
        initialRouteName="LibraryScreen" 
        screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}
    >
        <Stack.Screen 
            name="LibraryScreen" 
            component={LibraryScreen} 
        />
        <Stack.Screen 
            name="Curtidas" 
            component={Curtidas}
        />
        <Stack.Screen
          name="PlaylistScreen"
          component={Playlist}
        />
    </Stack.Navigator>
  );
};

export default Navigation;

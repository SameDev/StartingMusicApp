import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
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
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Search') {
                iconName = 'search';
              } else if (route.name === 'Library') {
                iconName = 'bars';
              } else if (route.name === 'Music') {
                iconName = 'music';
              }

              return <FontAwesome name={iconName as undefined} size={35} color={color} />;
            },
            tabBarShowLabel: false,
            tabBarStyle: { 
              backgroundColor: MyTheme.colors.card, 
              paddingBottom: 40, 
              paddingTop: 40, 
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20,
              borderWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarActiveTintColor: MyTheme.colors.iconSelect,
            tabBarInactiveTintColor: MyTheme.colors.iconDefault,
            headerShown: false
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Library" component={LibraryScreen} />
          <Tab.Screen name="Music" component={MusicStack} />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

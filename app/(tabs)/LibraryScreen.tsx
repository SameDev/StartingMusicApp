import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyTheme = useThemeColor;

const LibraryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Biblioteca</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MyTheme.colors.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});

export default LibraryScreen;

import { ErrorBoundaryProps, Link, Redirect } from 'expo-router';
import { View, Text } from 'react-native';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
    return (
      <View style={{ flex: 1, backgroundColor: "red" }}>
        <Text>{error.message}</Text>
        <Text onPress={retry}>Try Again?</Text>
      </View>
    );
  }

export default function NotFound() {
 return (
   <Redirect href="./"/>
 );
}
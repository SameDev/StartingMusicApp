/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/HomeScreen` | `/(tabs)/LibraryScreen` | `/(tabs)/LoginScreen` | `/(tabs)/MusicList` | `/(tabs)/MusicPlayerScreen` | `/(tabs)/RegisterScreen` | `/(tabs)/SearchScreen` | `/(tabs)/UserScreen` | `/HomeScreen` | `/LibraryScreen` | `/LoginScreen` | `/MusicList` | `/MusicPlayerScreen` | `/RegisterScreen` | `/SearchScreen` | `/UserScreen` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}

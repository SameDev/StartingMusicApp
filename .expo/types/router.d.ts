/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/HomeScreen` | `/(tabs)/LibraryScreen` | `/(tabs)/MusicPlayerScreen` | `/(tabs)/SearchScreen` | `/(tabs)\MusicList` | `/HomeScreen` | `/LibraryScreen` | `/MusicPlayerScreen` | `/SearchScreen` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}

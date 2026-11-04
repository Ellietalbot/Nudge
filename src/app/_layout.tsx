import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import SetupScreen from "@/components/setup-screen";
import { initDb } from "@/db/init";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import { useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

SplashScreen.preventAutoHideAsync();
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [name, setName] = useState(() => Storage.getItemSync("childName"));

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="nudge.db" onInit={initDb}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </SQLiteProvider>
      {/* Outside SQLiteProvider on purpose: its memo ignores children changes,
          so anything inside it wouldn't update when `name` changes. */}
      {!name && (
        <View style={StyleSheet.absoluteFill}>
          <SetupScreen onDone={setName} />
        </View>
      )}
    </ThemeProvider>
  );
}

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import SetupScreen from "@/components/setup-screen";
import { UsageTracker } from "@/components/usage-tracker";
import { initDb } from "@/db/init";
import { useNudgeFonts } from "@/design-system";
import { ChildNameContext } from "@/lib/child-name";
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
  // Figtree must load before anything renders, or Text falls back to the
  // system font. The splash stays up until then; AnimatedSplashOverlay
  // hides it once it mounts. On a font error, carry on with the fallback.
  const [fontsLoaded, fontError] = useNudgeFonts();
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Context updates reach screens even through SQLiteProvider's memo. */}
      <ChildNameContext.Provider value={name}>
        <SQLiteProvider databaseName="nudge.db" onInit={initDb}>
          <AnimatedSplashOverlay />
          <UsageTracker />
          <AppTabs />
        </SQLiteProvider>
      </ChildNameContext.Provider>
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

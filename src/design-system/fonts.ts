/**
 * Load Figtree once in the root layout, before hiding the splash screen:
 *
 *   const [fontsLoaded, fontError] = useNudgeFonts();
 *   useEffect(() => { if (fontsLoaded || fontError) SplashScreen.hideAsync(); }, [fontsLoaded, fontError]);
 *   if (!fontsLoaded && !fontError) return null;
 *
 * Install: npx expo install @expo-google-fonts/figtree expo-font
 */
import {
  useFonts,
  Figtree_500Medium,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
} from '@expo-google-fonts/figtree';

export function useNudgeFonts() {
  return useFonts({ Figtree_500Medium, Figtree_700Bold, Figtree_800ExtraBold, Figtree_900Black });
}

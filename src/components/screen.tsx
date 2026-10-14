import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette, space } from "@/design-system";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.cream },
  content: { padding: space[5], paddingBottom: space[20], gap: space[2] },
});

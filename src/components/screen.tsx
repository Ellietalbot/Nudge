import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, space } from "@/design-system";

export function Screen({
  children,
  scroll = true,
  overlay,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  /** Floats above the content and doesn't scroll, e.g. a GotIt from useGotIt(). */
  overlay?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {scroll ? (
        // TODO: the existing ScrollView, unchanged
        <ScrollView
          contentContainerStyle={styles.content}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        // TODO: a <View> with style={styles.fixed} and {children} inside
        <View style={styles.fixed}>{children}</View>
      )}
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.cream },
  content: { padding: space[5], paddingBottom: space[20], gap: space[2] },
  fixed: { flex: 1, padding: space[5], gap: space[2] },
});

import { Screen } from "@/components/screen";
import { Button, Text, palette } from "@/design-system";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import { StyleSheet, TextInput } from "react-native";

export default function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [mode, setMode] = useState<"loading" | "setup" | "enter">("loading");

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  useFocusEffect(
    useCallback(() => {
      async function checkPin() {
        const saved = await SecureStore.getItemAsync("parentPin");
        if (saved === null) {
          setMode("setup");
        } else {
          setMode("enter");
        }
      }
      setPin("");
      setError("");
      checkPin();
    }, []),
  );
  return (
    <Screen>
      {mode === "loading" && <Text variant="body">Loading…</Text>}
      {mode === "setup" && (
        <>
          <Text variant="heading">Set a PIN</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={4}
            style={styles.pinInput}
            accessibilityLabel="New 4-digit PIN"
          />
          <Button
            label="Save PIN"
            disabled={pin.length !== 4}
            reason="Type 4 numbers first."
            onPress={async () => {
              await SecureStore.setItemAsync("parentPin", pin);
              onUnlock();
            }}
          />
        </>
      )}
      {mode === "enter" && (
        <>
          <Text variant="heading">Enter your PIN</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={4}
            style={styles.pinInput}
            accessibilityLabel="Your 4-digit PIN"
          />
          {error !== "" && (
            <Text variant="body" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
          <Button
            label="Unlock"
            disabled={pin.length !== 4}
            reason="Type 4 numbers first."
            onPress={async () => {
              const savedPin = await SecureStore.getItemAsync("parentPin");
              if (savedPin === pin) {
                onUnlock();
              } else {
                setError("That PIN didn't match. Try again.");
                setPin("");
              }
            }}
          />
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  pinInput: {
    borderWidth: 2,
    borderColor: palette.navy,
    borderRadius: 16,
    padding: 16,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: "center",
  },
});

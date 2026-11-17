import { Screen } from "@/components/screen";
import { Button, PinPad, Text, type PinPadState } from "@/design-system";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";

const MAX_TRIES = 5;
const LOCK_MS = 60_000;

// Kept outside the component so leaving the tab and coming back doesn't
// reset the count or the lockout. Restarting the app does; that's fine for a
// convenience lock (FR11).
let triesLeft = MAX_TRIES;
let lockedUntil = 0;

type Mode = "loading" | "setup" | "confirm" | "enter";

export default function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState(""); // setup: the PIN to confirm
  const [padState, setPadState] = useState<PinPadState>("entry");
  const [tries, setTries] = useState(triesLeft);

  useFocusEffect(
    useCallback(() => {
      async function checkPin() {
        const saved = await SecureStore.getItemAsync("parentPin");
        setMode(saved === null ? "setup" : "enter");
      }
      setPin("");
      setFirstPin("");
      setTries(triesLeft);
      setPadState(Date.now() < lockedUntil ? "locked" : "entry");
      checkPin();
    }, []),
  );

  // Unlock the keypad when the minute is up.
  useEffect(() => {
    if (padState !== "locked") return;
    const timer = setTimeout(
      () => {
        triesLeft = MAX_TRIES;
        setTries(MAX_TRIES);
        setPadState("entry");
      },
      Math.max(0, lockedUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [padState]);

  async function complete(entered: string) {
    if (mode === "setup") {
      setFirstPin(entered);
      setPin("");
      setPadState("entry");
      setMode("confirm");
      return;
    }
    if (mode === "confirm") {
      if (entered === firstPin) {
        await SecureStore.setItemAsync("parentPin", entered);
        onUnlock();
      } else {
        setFirstPin("");
        setPin("");
        setPadState("wrong");
        setMode("setup");
      }
      return;
    }
    const savedPin = await SecureStore.getItemAsync("parentPin");
    if (savedPin === entered) {
      triesLeft = MAX_TRIES;
      onUnlock();
      return;
    }
    triesLeft -= 1;
    setTries(triesLeft);
    setPin("");
    if (triesLeft <= 0) {
      lockedUntil = Date.now() + LOCK_MS;
      setPadState("locked");
    } else {
      setPadState("wrong");
    }
  }

  function press(digit: string) {
    if (padState === "locked" || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) complete(next);
  }

  // The PIN is a convenience lock (FR11), not a security boundary, so a
  // forgotten PIN can simply be replaced. The journal isn't touched.
  function forgotPin() {
    Alert.alert(
      "Set a new PIN?",
      "Your old PIN will be removed. Your child's journal stays the same.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Set a new PIN",
          onPress: async () => {
            await SecureStore.deleteItemAsync("parentPin");
            triesLeft = MAX_TRIES;
            lockedUntil = 0;
            setTries(MAX_TRIES);
            setPin("");
            setFirstPin("");
            setPadState("entry");
            setMode("setup");
          },
        },
      ],
    );
  }

  if (mode === "loading") {
    return (
      <Screen>
        <Text variant="body">Loading…</Text>
      </Screen>
    );
  }

  const subtitle =
    mode === "setup"
      ? "Choose a 4-digit PIN"
      : mode === "confirm"
        ? "Type the same PIN again"
        : "Enter your 4-digit PIN";

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
        <PinPad
          title={mode === "enter" ? "Grown-ups" : "Set a PIN"}
          subtitle={subtitle}
          state={padState}
          digits={pin.length}
          triesLeft={tries}
          wrongMessage={
            mode === "setup" ? "Those PINs didn't match. Try again." : undefined
          }
          onDigit={press}
          onBack={() => setPin((p) => p.slice(0, -1))}
          onCancel={() => setPin("")}
        />
        {mode === "enter" && (
          <Button label="Forgot PIN?" variant="quiet" onPress={forgotPin} />
        )}
      </View>
    </Screen>
  );
}

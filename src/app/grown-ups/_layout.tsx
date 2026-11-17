import PinGate from "@/components/pin-gate";
import { LockContext } from "@/lib/lock";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// Everything in the Grown Ups tab sits behind the PIN. The lock lives here,
// not in a screen, so opening an entry and coming back doesn't relock it.
export default function GrownUpsLayout() {
  const [unlocked, setUnlocked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // The returned function is a cleanup: it runs when you leave the tab.
      return () => setUnlocked(false);
    }, []),
  );

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return (
    <LockContext.Provider value={() => setUnlocked(false)}>
      <Stack screenOptions={{ headerShown: false }} />
    </LockContext.Provider>
  );
}

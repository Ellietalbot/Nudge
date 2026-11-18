import { saveUsageSession } from "@/db/usage";
import { endSession, startSession } from "@/lib/usage";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState } from "react-native";

// Records how long Nudge is open: starts a session when the app comes to the
// front and saves it when the app leaves. Draws nothing.
export function UsageTracker() {
  const db = useSQLiteContext();

  useEffect(() => {
    startSession(); // the app is open right now
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        startSession();
      } else {
        const session = endSession();
        if (session) {
          saveUsageSession(db, session.start, session.end).catch((error) =>
            console.warn("Couldn't save app time:", error),
          );
        }
      }
    });
    return () => subscription.remove();
  }, [db]);

  return null;
}

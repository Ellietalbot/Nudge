import { Screen } from "@/components/screen";
import { listDashboardEntries, type DashboardRow } from "@/db/journal";
import { usageSecondsSince } from "@/db/usage";
import { Button, Text, palette, radius, shadow, space } from "@/design-system";
import { getCameraEnabled, setCameraEnabled } from "@/lib/camera-setting";
import { useChildName } from "@/lib/child-name";
import { formatEntryDate } from "@/lib/journal-entry";
import { useLock } from "@/lib/lock";
import type { NudgeSafety } from "@/lib/nudge-api";
import {
  currentSessionSeconds,
  formatDuration,
  startOfToday,
} from "@/lib/usage";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

export default function Dashboard() {
  const name = useChildName();
  const [entries, setEntries] = useState<DashboardRow[]>([]);
  const db = useSQLiteContext();
  const lock = useLock();

  const [cameraOn, setCameraOn] = useState(getCameraEnabled);
  const [usageSeconds, setUsageSeconds] = useState(0);

  function toggleCamera(on: boolean) {
    setCameraEnabled(on); // save it on the device
    setCameraOn(on); // update the screen
  }

  useFocusEffect(
    useCallback(() => {
      listDashboardEntries(db)
        .then(setEntries)
        .catch((error) => console.warn("Couldn't load the dashboard:", error));
      // Today only: from midnight, plus the visit that's running now.
      const today = startOfToday();
      usageSecondsSince(db, today)
        .then((saved) =>
          setUsageSeconds(saved + currentSessionSeconds(new Date(), today)),
        )
        .catch((error) => console.warn("Couldn't load app time:", error));
    }, [db]),
  );

  return (
    <Screen>
      <Text variant="heading">Grown-Ups</Text>
      <Text variant="body" color={palette.navyMuted}>
        {name ?? "Your explorer"} has saved {entries.length}{" "}
        {entries.length === 1 ? "exploration" : "explorations"}.
      </Text>
      <Text variant="body" color={palette.navyMuted}>
        Time in Nudge today: {formatDuration(usageSeconds)}
      </Text>
      <Button label="Lock" variant="secondary" onPress={lock} />
      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text variant="label">Camera</Text>
          <Text variant="body" color={palette.navyMuted}>
            {cameraOn
              ? `${name ?? "Your explorer"} can take photos.`
              : `${name ?? "Your explorer"} can only type questions.`}
          </Text>
        </View>
        <Switch
          value={cameraOn}
          onValueChange={toggleCamera}
          accessibilityLabel="Camera"
        />
      </View>
      {entries.length === 0 ? (
        <Text variant="body">
          Nothing saved yet. Explorations show up here once they're saved to the
          journal.
        </Text>
      ) : (
        <View style={{ gap: space[3] }}>
          {entries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/grown-ups/${entry.id}`)}
              accessibilityRole="button"
              accessibilityHint="Opens the whole chat"
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text variant="label" color={palette.navyMuted}>
                {formatEntryDate(entry.created_at)} ·{" "}
                {entry.input_type === "photo" ? "Photo" : "Typed"} ·{" "}
                {entry.message_count} messages
              </Text>
              <Row label="Safety" text={SAFETY_NOTE[entry.safety_level]} />
              <Row label="Noticed" text={entry.noticed_text} />
              <Row label="Asked" text={entry.child_question_text} />
              <Row label="Guessed" text={entry.hypothesis_text} />
              <Row label="Tried" text={entry.experiment_text} lines={3} />
              <Row label="Found" text={entry.finding_text} />
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

// What the safety level means, for a grown-up. "none" shows no row.
const SAFETY_NOTE: Record<NudgeSafety, string | null> = {
  none: null,
  caution: "Nudge said to be careful.",
  askAdult: "Nudge asked for a grown-up's help.",
  doNotTouch: "Nudge said not to touch it.",
  stop: "Nudge stopped this exploration.",
};

// One step's line on a card. Shows nothing if that step wasn't saved.
function Row({
  label,
  text,
  lines,
}: {
  label: string;
  text: string | null;
  lines?: number;
}) {
  if (text === null) return null;
  return (
    <View>
      <Text variant="label">{label}</Text>
      <Text variant="body" numberOfLines={lines}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.paper,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2],
    boxShadow: shadow.card,
  },
  pressed: { opacity: 0.7 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: space[3] },
});

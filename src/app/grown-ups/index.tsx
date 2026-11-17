import { Screen } from "@/components/screen";
import { listDashboardEntries, type DashboardRow } from "@/db/journal";
import { Button, Text, palette, radius, shadow, space } from "@/design-system";
import { useChildName } from "@/lib/child-name";
import { formatEntryDate } from "@/lib/journal-entry";
import { useLock } from "@/lib/lock";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Dashboard() {
  const name = useChildName();
  const [entries, setEntries] = useState<DashboardRow[]>([]);
  const db = useSQLiteContext();
  const lock = useLock();

  useFocusEffect(
    useCallback(() => {
      listDashboardEntries(db)
        .then(setEntries)
        .catch((error) => console.warn("Couldn't load the dashboard:", error));
    }, [db]),
  );

  return (
    <Screen>
      <Text variant="heading">Grown-Ups</Text>
      <Text variant="body" color={palette.navyMuted}>
        {name ?? "Your explorer"} has saved {entries.length}{" "}
        {entries.length === 1 ? "exploration" : "explorations"}.
      </Text>
      <Button label="Lock" variant="secondary" onPress={lock} />
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
});

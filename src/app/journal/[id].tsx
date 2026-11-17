import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import { getEntryChat, getEntrySummary, type EntrySummary } from "@/db/journal";
import { BackLink, Text, palette, radius, space } from "@/design-system";
import {
  chatToThread,
  formatEntryDate,
  type ChatLine,
} from "@/lib/journal-entry";
import { savedPhotoUri } from "@/lib/saved-photo";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

// One saved exploration: its photo and question at the top, then the chat.
// Also used by the parent dashboard (grown-ups/[id].tsx re-exports it).
export default function JournalEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [summary, setSummary] = useState<EntrySummary | null>(null);
  const db = useSQLiteContext();

  useEffect(() => {
    getEntryChat(db, Number(id))
      .then(setChat)
      .catch((error) =>
        console.warn("Couldn't load this entry's chat:", error),
      );
    getEntrySummary(db, Number(id))
      .then(setSummary)
      .catch((error) => console.warn("Couldn't load this entry:", error));
  }, [db, id]);

  const { messages, stepStarts } = chatToThread(chat);

  return (
    <Screen scroll={false}>
      <BackLink onPress={() => router.back()} />
      {summary && (
        <View style={styles.header}>
          {summary.photo_path && (
            <Image
              source={{ uri: savedPhotoUri(summary.photo_path) }}
              style={styles.photo}
              accessibilityIgnoresInvertColors
              accessible
              accessibilityLabel="Your photo"
            />
          )}
          <View style={styles.headerText}>
            <Text variant="title">
              {summary.child_question_text ?? "My discovery"}
            </Text>
            <Text variant="caption" color={palette.navyMuted}>
              {formatEntryDate(summary.created_at)}
            </Text>
          </View>
        </View>
      )}
      <ChatThread
        messages={messages}
        stepStarts={stepStarts}
        loading={false}
        autoScroll={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[2],
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
  },
  headerText: { flex: 1, gap: space[1] },
});

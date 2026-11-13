import { Screen } from "@/components/screen";
import {
  EmptyState,
  Illustration,
  JournalCover,
  JournalEntryRow,
  space,
} from "@/design-system";
import { useChildName } from "@/lib/child-name";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { listEntries, type EntryRow } from "@/db/journal";
import { Image, View } from "react-native";
import { formatEntryDate } from "@/lib/journal-entry";
import { savedPhotoUri } from "@/lib/saved-photo";

export default function Journal() {
  const name = useChildName();
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      listEntries(db)
        .then(setEntries)
        .catch((error) =>
          console.warn("Couldn't load journal entries:", error),
        );
    }, [db]),
  );

  return (
    <Screen>
      <JournalCover name={name ?? "Explorer"} found={entries.length} />
      {entries.length === 0 ? (
        <EmptyState
          illustration={<Illustration name="bookOpen" size={120} />}
          title="No discoveries yet!"
          body="Go outside and find something interesting. Your first discovery is waiting for you!"
          action={{
            label: "Start exploring",
            onPress: () => router.push("/explore"),
          }}
        />
      ) : (
        <View style={{ gap: space[3] }}>
          {entries.map((entry) => (
            <JournalEntryRow
              key={entry.id}
              question={entry.child_question_text ?? "My discovery"}
              line={entry.finding_text ?? ""}
              date={formatEntryDate(entry.created_at)}
              stepId="reflect"
              photo={
                entry.photo_path ? (
                  <Image
                    source={{ uri: savedPhotoUri(entry.photo_path) }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : undefined
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getEntryChat } from "@/db/journal";
import { chatToThread, type ChatLine } from "@/lib/journal-entry";
import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import { BackLink } from "@/design-system";

export default function JournalEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState<ChatLine[]>([]);
  const db = useSQLiteContext();

  useEffect(() => {
    getEntryChat(db, Number(id))
      .then(setChat)
      .catch((error) =>
        console.warn("Couldn't load this entry's chat:", error),
      );
  }, [db, id]);

  const { messages, stepStarts } = chatToThread(chat);

  return (
    <Screen scroll={false}>
      <BackLink onPress={() => router.back()} />
      <ChatThread
        messages={messages}
        stepStarts={stepStarts}
        loading={false}
        autoScroll={false}
      />
    </Screen>
  );
}

import { Screen } from "@/components/screen";
import { EmptyState, Illustration, JournalCover } from "@/design-system";
import { router } from "expo-router";

export default function Journal() {
  return (
    <Screen>
      <JournalCover name="My Journal" found={0} />
      <EmptyState
        illustration={<Illustration name="bookOpen" size={120} />}
        title="No discoveries yet!"
        body="Go outside and find something interesting. Your first discovery is waiting for you!"
        action={{
          label: "Start exploring",
          onPress: () => router.push("/explore"),
        }}
      />
    </Screen>
  );
}

import { EmptyState, JournalCover } from "@/design-system";

export default function Journal() {
  return (
    <>
      <JournalCover name="My Journal" found={0} />
      <EmptyState
        title="No discoveries yet!"
        body="Go outside and find something interesting. Your first discovery is waiting for you!"
        action={{ label: "Start exploring", onPress: () => {} }}
      />
    </>
  );
}

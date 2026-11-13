import { Stack } from "expo-router";

// The Journal tab is a stack: the list (index.tsx), and one entry's page
// ([id].tsx) slides in on top of it.
export default function JournalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

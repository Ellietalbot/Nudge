import { ExplorationProvider } from "@/lib/exploration-context";
import { Stack } from "expo-router";

export default function Explore() {
  return (
    <ExplorationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ExplorationProvider>
  );
}

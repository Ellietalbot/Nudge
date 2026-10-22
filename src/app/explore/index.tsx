import { Screen } from "@/components/screen";
import { AIDisclosure, Button } from "@/design-system";
import { askNudge } from "@/lib/nudge-api";
import { router } from "expo-router";

async function testNudgeAPI() {
  try {
    const response = await askNudge([
      {
        role: "user",
        content: "Say hi to a curious 8-year-old in one sentence.",
      },
    ]);
    console.log("Nudge API response:", response);
  } catch (error) {
    console.error("Error calling Nudge API:", error);
  }
}
export default function Index() {
  return (
    <Screen>
      <AIDisclosure onDone={() => router.push("/explore/camera")} />
      <Button label="Test Nudge API" onPress={testNudgeAPI} />
    </Screen>
  );
}

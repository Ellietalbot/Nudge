import { Screen } from "@/components/screen";
import { AIDisclosure } from "@/design-system";
import { router } from "expo-router";

export default function Index() {
  return (
    <Screen>
      <AIDisclosure onDone={() => router.push("/explore/camera")} />
    </Screen>
  );
}

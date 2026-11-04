import Onboarding from "@/components/onboarding";
import { Screen } from "@/components/screen";
import { AIDisclosure } from "@/design-system";
import { router } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { useState } from "react";

export default function Index() {
  const [seen, setSeen] = useState(
    () => Storage.getItemSync("onboardingSeen") === "true",
  );
  function finishOnboarding() {
    Storage.setItemSync("onboardingSeen", "true");
    setSeen(true);
  }
  if (!seen) {
    return <Onboarding onDone={finishOnboarding} />;
  }
  return (
    <Screen>
      <AIDisclosure onDone={() => router.push("/explore/camera")} />
    </Screen>
  );
}

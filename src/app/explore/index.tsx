import { AIDisclosure } from "@/design-system";
import { router } from "expo-router";

export default function Index() {
  return (
    <>
      <AIDisclosure onDone={() => router.push("/explore/observe")} />
    </>
  );
}

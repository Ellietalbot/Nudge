import { BackLink, HypothesisBuilder, StepProgress } from "@/design-system";
import { router } from "expo-router";
import { View } from "react-native";

export default function Hypothesize() {
  return (
    <>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={3} />
      </View>

      <HypothesisBuilder
        parts={[0, "change because they need to", 1, "."]}
        banks={[
          { label: "What?", words: ["Leaves", "Ice", "Seeds", "Worms"] },
          {
            label: "Why?",
            words: ["get warm", "get cold", "get sunlight", "get water"],
          },
        ]}
        onDone={() => router.push("/explore/investigate")}
      />
    </>
  );
}

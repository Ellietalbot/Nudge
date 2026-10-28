import { Screen } from "@/components/screen";
import { BackLink, PromptCard, StepProgress } from "@/design-system";
import { useExploration } from "@/lib/exploration-context";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function Ask() {
  const { messages } = useExploration();
  console.log(messages);
  const [text, setText] = useState("");

  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={2} />
      </View>

      <PromptCard
        stepId="ask"
        question="What do you wonder?"
        example="why the leaves are changing color."
        value={text}
        onChangeText={setText}
        onSave={() => router.push("/explore/hypothesize")}
      />
    </Screen>
  );
}

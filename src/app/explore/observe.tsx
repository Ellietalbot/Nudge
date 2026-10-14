import { BackLink, PromptCard, StepProgress } from "@/design-system";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function Observe() {
  const [text, setText] = useState("");

  return (
    <>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={1} />
      </View>

      <PromptCard
        stepId="observe"
        question="What do you notice?"
        example="that the leaves are changing color."
        photo
        value={text}
        onChangeText={setText}
        onSave={() => router.push("/explore/ask")}
      />
    </>
  );
}

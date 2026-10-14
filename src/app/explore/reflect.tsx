import { Screen } from "@/components/screen";
import { BackLink, PromptCard, StepProgress } from "@/design-system";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function Reflect() {
  const [text, setText] = useState("");

  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={5} />
      </View>

      <PromptCard
        stepId="reflect"
        question="What did you learn?"
        example="leaves need sunlight to stay green."
        value={text}
        onChangeText={setText}
        onSave={() => router.push("/journal")}
      />
    </Screen>
  );
}

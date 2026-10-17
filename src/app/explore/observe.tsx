import { Screen } from "@/components/screen";
import { BackLink, PromptCard, StepProgress } from "@/design-system";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Image } from "react-native";

export default function Observe() {
  const [text, setText] = useState("");
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();

  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={1} />
      </View>
      {photoUri && <Image source={{ uri: photoUri }} style={{ height: 240, borderRadius: 24 }} />}
      <PromptCard
        stepId="observe"
        question="What do you notice?"
        example="that the leaves are changing color."
        photo={!photoUri}
        onAddPhoto={() => router.push("/explore/camera")}
        value={text}
        onChangeText={setText}
        onSave={() => router.push("/explore/ask")}
      />
    </Screen>
  );
}

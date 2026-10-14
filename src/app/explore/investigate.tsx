import { Screen } from "@/components/screen";
import { BackLink, InvestigationCard, StepProgress } from "@/design-system";
import { router } from "expo-router";
import { View } from "react-native";

export default function Investigate() {
  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={4} />
      </View>

      <InvestigationCard
        question="Do leaves need sunlight to stay green?"
        minutes="About 5 minutes a day"
        safety={[{ icon: "adult", label: "With a grown-up" }]}
        materials={[
          {
            emoji: "🪴",
            name: "A plant with green leaves",
            quantity: "Indoors or outside",
          },
          { emoji: "📄", name: "Paper or foil", quantity: "A small piece" },
          { emoji: "📎", name: "Paper clip", quantity: "1" },
        ]}
        steps={[
          {
            instruction: "Fold the paper over part of one leaf and clip it on.",
            tip: "Leave the leaf on the plant, so it stays alive.",
          },
          { instruction: "Leave it in a sunny spot for one week." },
          {
            instruction:
              "Take the paper off. Look at the covered part and the uncovered part.",
            tip: "Take a photo before and after so you can compare.",
          },
        ]}
        onDone={() => router.push("/explore/reflect")}
      />
    </Screen>
  );
}

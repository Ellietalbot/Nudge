import { Screen } from "@/components/screen";
import {
    Button,
    Illustration,
    IllustrationName,
    ReadAloudButton,
    Text,
} from "@/design-system";
import { useState } from "react";
import { View } from "react-native";

const pages: { illustration: IllustrationName; title: string; body: string }[] =
  [
    {
      illustration: "robotPointing",
      title: "Look closely",
      body: "Find something interesting. Take a photo or tell me about it.",
    },
    {
      illustration: "robotQuestion",
      title: "Ask questions",
      body: "Ask your own question about it. I’ll help you think!",
    },
    {
      illustration: "robotThinking",
      title: "Figure it out",
      body: "We’ll guess, try it out, and see what happens!",
    },
  ];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0);
  const current = pages[page];
  const isLast = page === pages.length - 1;

  return (
    <Screen scroll={false}>
      <View
        style={{
          alignItems: "center",
          gap: 16,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Illustration name={current.illustration} size={200} />
        <Text variant="heading" align="center">
          {current.title}
        </Text>
        <Text variant="body" align="center">
          {current.body}
        </Text>
        <View>
          <ReadAloudButton text={`${current.title}. ${current.body}`} />
        </View>
        <Button
          label={isLast ? "Let's go!" : "Next"}
          onPress={() => {
            if (isLast) {
              onDone();
            } else {
              setPage((p) => p + 1);
            }
          }}
        />
      </View>
    </Screen>
  );
}

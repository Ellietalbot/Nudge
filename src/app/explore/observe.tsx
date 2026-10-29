import { Screen } from "@/components/screen";
import {
  BackLink,
  ErrorState,
  PromptCard,
  SkeletonCard,
  StepProgress,
} from "@/design-system";
import { useExploration } from "@/lib/exploration-context";
import { askNudge, Message } from "@/lib/nudge-api";
import { preparePhoto } from "@/lib/photo";
import { OBSERVE_PROMPT } from "@/lib/prompts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

export default function Observe() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [photoMessage, setPhotoMessage] = useState<Message | null>(null);
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    photoUri ? "loading" : "idle",
  );
  const { addMessages, reset } = useExploration();

  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;

    async function lookAtPhoto(uri: string) {
      try {
        const base64Photo = await preparePhoto(uri);
        const firstMessage: Message = {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Photo,
              },
            },
            { type: "text", text: "Look what I found!" },
          ],
        };
        const answer = await askNudge([firstMessage], OBSERVE_PROMPT);

        console.log("Nudge says:", answer);
        if (!cancelled) {
          setReply(answer);
          setPhotoMessage(firstMessage);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setStatus("error");
        }
      }
    }

    lookAtPhoto(photoUri);

    return () => {
      cancelled = true;
    };
  }, [photoUri, attempt]);

  function handleSave() {
    if (!photoMessage) return;
    reset();
    addMessages(
      photoMessage,
      { role: "assistant", content: reply },
      { role: "user", content: `I noticed ${text}` },
    );
    router.push("/explore/ask");
  }
  let card;

  if (status === "loading") {
    card = <SkeletonCard />;
  } else if (status === "error") {
    card = (
      <ErrorState
        onRetry={() => {
          setStatus("loading");
          setAttempt((a) => a + 1);
        }}
        title="Oops! Nudge couldn’t see that"
        body="Check that you are connected to the internet, then try again."
      />
    );
  } else {
    card = (
      <PromptCard
        stepId="observe"
        question={status === "ready" ? reply : "What do you notice?"}
        example="that the leaves are changing color."
        photo={!photoUri}
        onAddPhoto={() => router.push("/explore/camera")}
        value={text}
        onChangeText={setText}
        onSave={handleSave}
      />
    );
  }

  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={1} />
      </View>
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={{ height: 240, borderRadius: 24 }}
        />
      )}
      {card}
    </Screen>
  );
}

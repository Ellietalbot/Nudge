import { Screen } from "@/components/screen";
import {
  BackLink,
  Button,
  ErrorState,
  PromptCard,
  SafetyCard,
  SkeletonCard,
  StepProgress,
  Text,
} from "@/design-system";
import { useExploration } from "@/lib/exploration-context";
import {
  askNudge,
  Message,
  NudgeSafety,
  parseObserveReply,
} from "@/lib/nudge-api";
import { preparePhoto } from "@/lib/photo";
import { OBSERVE_PROMPT } from "@/lib/prompts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

// Photos Nudge can't explore: show the reply and a retake button instead of the text box.
const RETAKE_OBJECTS = ["unclear", "person", "private"];

export default function Observe() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [safety, setSafety] = useState<NudgeSafety>("none");
  const [object, setObject] = useState("");
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
        const raw = await askNudge([firstMessage], OBSERVE_PROMPT);
        const result = parseObserveReply(raw);

        console.log("Nudge says:", result);
        if (!cancelled) {
          setReply(result.reply);
          setSafety(result.safety);
          setObject(result.object);
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
  } else if (safety === "stop") {
    // Distress or inappropriate content: no text box and no Save button,
    // so the child can't continue the exploration from here.
    card = (
      <View style={{ gap: 16 }}>
        <SafetyCard level="stop" />
        <Text variant="reading">{reply}</Text>
      </View>
    );
  } else if (RETAKE_OBJECTS.includes(object)) {
    card = (
      <View style={{ gap: 16 }}>
        <Text variant="reading">{reply}</Text>
        <Button
          label="Take a new photo"
          onPress={() => router.replace("/explore/camera")}
        />
      </View>
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
      {photoUri && safety !== "stop" && (
        <Image
          source={{ uri: photoUri }}
          style={{ height: 240, borderRadius: 24 }}
        />
      )}
      {status === "ready" && safety !== "none" && safety !== "stop" && (
        <SafetyCard
          level={safety}
          compact={safety === "caution" || safety === "askAdult"}
        />
      )}
      {card}
    </Screen>
  );
}

import { Screen } from "@/components/screen";
import {
  BackLink,
  Button,
  ErrorState,
  PromptCard,
  SafetyCard,
  StepProgress,
  Text,
  ThinkingState,
} from "@/design-system";
import { AppErrorKind, ERROR_COPY } from "@/lib/error-copy";
import { useExploration } from "@/lib/exploration-context";
import {
  askNudge,
  Message,
  NudgeError,
  NudgeSafety,
  parseNudgeReply,
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
  const [errorKind, setErrorKind] = useState<AppErrorKind>("server");

  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;

    async function lookAtPhoto(uri: string) {
      let base64Photo: string;
      try {
        base64Photo = await preparePhoto(uri);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setErrorKind("photo");
          setStatus("error");
        }
        return;
      }
      try {
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
        const result = parseNudgeReply(raw);

        console.log("Nudge says:", result);
        if (!cancelled) {
          setReply(result.reply);
          setSafety(result.safety);
          setObject(result.object ?? "unclear"); // no object = can't explore, ask for a retake
          setPhotoMessage(firstMessage);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setErrorKind(error instanceof NudgeError ? error.kind : "server");
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
    const trimmed = text.trim();
    if (!trimmed) return;
    reset();
    const messages: Message[] = [];
    if (photoMessage) {
      messages.push(
        photoMessage,
        { role: "assistant", content: reply },
        {
          role: "user",
          content: `I noticed ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`,
        },
      );
    } else {
      messages.push({
        role: "user",
        content: `I noticed ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`,
      });
    }
    addMessages(...messages);
    router.push("/explore/ask");
  }
  let card;

  if (status === "loading") {
    card = <ThinkingState title="Nudge is taking a look…" />;
  } else if (status === "error") {
    const isPhotoError = errorKind === "photo";
    card = (
      <ErrorState
        onRetry={() => {
          if (isPhotoError) {
            router.replace("/explore/camera");
            return;
          }
          setStatus("loading");
          setAttempt((a) => a + 1);
        }}
        title={ERROR_COPY[errorKind].title}
        body={ERROR_COPY[errorKind].body}
        retryLabel={ERROR_COPY[errorKind].retryLabel}
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
        <StepProgress current={0} />
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

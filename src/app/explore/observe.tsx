import { Screen } from "@/components/screen";
import { BackLink, PromptCard, StepProgress } from "@/design-system";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Image, View } from "react-native";
import { askNudge } from "@/lib/nudge-api";
import { preparePhoto } from "@/lib/photo";
import { OBSERVE_PROMPT } from "@/lib/prompts";

export default function Observe() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const [status, setStatus] = useState< "idle" | "loading" | "ready" | "error">(photoUri? "loading" : "idle");

  useEffect(() => {
    if (!photoUri) return;      // Talk path / no photo: nothing to do
      let cancelled = false;

      async function lookAtPhoto(uri: string) {
        try {
          // 1. turn photoUri into base64 with preparePhoto
          const base64Photo = await preparePhoto(uri);
          // 2. call askNudge with the image + "Look what I found!" message and OBSERVE_PROMPT
          //    (the message shape is in `git show HEAD~1:src/app/explore/camera.tsx`)
          const answer = await askNudge([
              {
                role: "user",
                content: [
                  {
                    type: "image",
                    source: { type: "base64", media_type: "image/jpeg", data: base64Photo },
                  },
                  {
                    type: "text",
                    text: "Look what I found!",
                  },
                ],
              }], OBSERVE_PROMPT)
            
          console.log("Nudge says:", answer)
          // 3. if not cancelled: save the answer with setReply, set status to "ready"
          if(!cancelled){
            setReply(answer);
            setStatus("ready")
          }
          

        } catch (error) {
          // 4. if not cancelled: log the error, set status to "error"
          if(!cancelled){
            console.error(error);
            setStatus("error");
          }

        }
      }

      lookAtPhoto(photoUri);

      return () => {
        cancelled = true;          // runs when the child leaves the screen
      };
  }, [photoUri]);

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

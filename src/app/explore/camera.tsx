import { Screen } from "@/components/screen";
import { Button, Text } from "@/design-system";
import { askNudge } from "@/lib/nudge-api";
import { preparePhoto } from "@/lib/photo";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Linking } from "react-native";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo) {
      // TEMPORARY
      try {
        const base64Photo = await preparePhoto(photo.uri);
        console.log("base64 length:", base64Photo.length);
        console.log(
          "approx kb:",
          Math.round((base64Photo.length * 0.75) / 1024),
        );
        const reply = await askNudge([
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64Photo },
              },
              {
                type: "text",
                text: "What is in this photo? Answer in one sentence.",
              },
            ],
          },
        ]);
        console.log("Claude sees:", reply);
      } catch (error) {
        console.error("Photo test failed", error);
      }
      setPhotoUri(photo.uri);
    } else {
      console.error("Failed to take photo");
    }
  }

  if (permission === null) {
    return (
      <Screen>
        <Text variant="heading">Checking the camera…</Text>
      </Screen>
    );
  } else if (permission.granted === false && permission.canAskAgain === true) {
    return (
      <Screen>
        <Text variant="heading">Nudge wants to see what you found!</Text>
        <Text variant="body">
          Nudge uses the camera to look at things with you.
        </Text>
        <Button label="Let Nudge use the camera" onPress={requestPermission} />
      </Screen>
    );
  } else if (permission.granted === false && permission.canAskAgain === false) {
    return (
      <Screen>
        <Text variant="heading">Nudge can't see yet.</Text>
        <Text variant="body">Ask a grown-up to turn it on.</Text>
        <Button
          label="Grown-ups: Settings"
          onPress={() => Linking.openSettings()}
        />
      </Screen>
    );
  } else {
    if (photoUri) {
      return (
        <Screen>
          <Image source={{ uri: photoUri }} style={{ height: 420 }} />
          <Text variant="body">Is this what you found?</Text>
          <Button
            label="Yes, send it to Nudge"
            onPress={() =>
              router.push({
                pathname: "/explore/observe",
                params: { photoUri },
              })
            }
          />
          <Button
            label="Take another photo"
            variant="secondary"
            onPress={() => setPhotoUri(null)}
          />
        </Screen>
      );
    }
    return (
      <Screen>
        <CameraView ref={cameraRef} style={{ height: 420 }} />
        <Button label="Take photo" onPress={takePhoto} />
      </Screen>
    );
  }
}

import { Screen } from "@/components/screen";
import { BackLink, Button, StepProgress, Text } from "@/design-system";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Linking, View } from "react-native";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo) {
      setPhotoUri(photo.uri);
    }
  }

  if (permission === null) {
    return (
      <Screen>
        <ObserveHeader />
        <Text variant="heading">Checking the camera…</Text>
      </Screen>
    );
  } else if (permission.granted === false && permission.canAskAgain === true) {
    return (
      <Screen>
        <ObserveHeader />
        <Text variant="heading">Nudge wants to see what you found!</Text>
        <Text variant="body">
          Nudge uses the camera to look at things with you.
        </Text>
        <Button label="Let Nudge use the camera" onPress={requestPermission} />
        <Button
          label="Type instead"
          variant="secondary"
          onPress={() => router.push("/explore/observe")}
        />
      </Screen>
    );
  } else if (permission.granted === false && permission.canAskAgain === false) {
    return (
      <Screen>
        <ObserveHeader />
        <Text variant="heading">Nudge can't see yet.</Text>
        <Text variant="body">Ask a grown-up to turn it on.</Text>
        <Button
          label="Grown-ups: Settings"
          onPress={() => Linking.openSettings()}
        />
        <Button
          label="Type instead"
          variant="secondary"
          onPress={() => router.push("/explore/observe")}
        />
      </Screen>
    );
  } else {
    if (photoUri) {
      return (
        <Screen>
          <ObserveHeader onBack={() => setPhotoUri(null)} />
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
        <ObserveHeader />
        <CameraView ref={cameraRef} style={{ height: 420 }} />
        <Button label="Take photo" onPress={takePhoto} />
        <Button
          label="Type instead"
          variant="secondary"
          onPress={() => router.push("/explore/observe")}
        />
      </Screen>
    );
  }
}

// Taking the photo (or choosing to type) is the Observe step, so the camera
// shows step 1 and a way back, like the other steps. On the "Is this what you
// found?" check, Back returns to the live camera instead.
function ObserveHeader({
  onBack = () => router.back(),
}: {
  onBack?: () => void;
}) {
  return (
    <View>
      <BackLink onPress={onBack} />
      <StepProgress current={0} />
    </View>
  );
}

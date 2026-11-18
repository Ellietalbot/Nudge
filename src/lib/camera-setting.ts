import Storage from "expo-sqlite/kv-store";

// Whether the child can use the camera. A grown-up turns it on or off from
// the dashboard. It stays on this device. On until a grown-up turns it off.
const KEY = "cameraEnabled";

export function getCameraEnabled(): boolean {
  return Storage.getItemSync(KEY) !== "false";
}

export function setCameraEnabled(on: boolean) {
  Storage.setItemSync(KEY, on ? "true" : "false");
}

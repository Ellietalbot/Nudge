import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.7;

export async function preparePhoto(uri: string): Promise<string> {
  // 1. Load the photo into a manipulator context
  const context = ImageManipulator.manipulate(uri);
  // 2. Queue a resize — width only
  const resized = context.resize({ width: MAX_WIDTH });
  // 3. Render it (this one is async)

  const rendered = await resized.renderAsync();
  // 4. Save as JPEG with your compress value and base64 turned on
  const result = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
    base64: true,
  });
    // 5. base64 is optional in the result — if it's missing, throw; otherwise return it
  if (!result.base64) {
    throw new Error("Failed to get base64 from the photo");
  }
  console.log("Photo prepared successfully");
  return result.base64;
}

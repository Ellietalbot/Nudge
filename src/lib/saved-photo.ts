import { Directory, File, Paths } from "expo-file-system";

// The camera's photo lives in a cache folder iOS can empty at any time, so a
// saved exploration gets its own copy in the app's documents folder.
//
// We store a *relative* path ("photos/photo-…jpg"), not the full file:// address:
// on iOS the documents folder's full path changes when the app is updated or
// reinstalled, so a saved full address would stop working.
export async function keepPhoto(uri: string): Promise<string> {
  const folder = new Directory(Paths.document, "photos");
  folder.create({ idempotent: true }); // fine if it already exists
  const name = `photo-${Date.now()}.jpg`;
  await new File(uri).copy(new File(folder, name));
  return `photos/${name}`;
}

// Turns a saved relative path back into an address <Image> can show.
export function savedPhotoUri(path: string): string {
  return new File(Paths.document, path).uri;
}

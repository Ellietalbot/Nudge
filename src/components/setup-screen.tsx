import { Screen } from "@/components/screen";
import { Button, Text, TextField } from "@/design-system";
import Storage from "expo-sqlite/kv-store";
import { useState } from "react";

export default function SetupScreen({
  onDone,
}: {
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    Storage.setItemSync("childName", trimmed);
    onDone(trimmed);
  }

  return (
    <Screen>
      <Text variant="heading">Let’s get set up</Text>
      <Text variant="body">What’s your explorer’s first name?</Text>
      <TextField label="First name" value={name} onChangeText={setName} />
      <Button label="Save" onPress={() => handleSave()} />
    </Screen>
  );
}

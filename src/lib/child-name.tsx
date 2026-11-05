import { createContext, useContext } from "react";

// The child's first name from the setup screen. It stays on the device and is
// never sent to Claude. Null until setup is done.
export const ChildNameContext = createContext<string | null>(null);

export function useChildName() {
  return useContext(ChildNameContext);
}

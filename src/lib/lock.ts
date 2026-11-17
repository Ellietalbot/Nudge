import { createContext, useContext } from "react";

// Lets screens inside the Grown Ups tab lock it again.
export const LockContext = createContext<() => void>(() => {});

export function useLock() {
  return useContext(LockContext);
}

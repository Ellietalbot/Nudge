import { NudgeErrorKind } from "./nudge-api";

export type AppErrorKind = NudgeErrorKind | "photo" | "save";
export const ERROR_COPY: Record<
  AppErrorKind,
  { title: string; body: string; retryLabel?: string }
> = {
  offline: {
    title: "Nudge can’t reach the internet",
    body: "Ask a grown-up to check the Wi-Fi. Your discovery is safe.",
  },
  timeout: {
    title: "Nudge is taking a long time",
    body: "The internet seems slow. Let’s try again!",
  },
  server: {
    title: "Nudge got stuck",
    body: "It’s not you, it’s Nudge! Try again in a minute.",
  },
  photo: {
    title: "Oops, Nudge couldn’t open that photo",
    body: "Let’s take a new one!",
    retryLabel: "Take a new photo",
  },
  save: {
    title: "Nudge couldn’t save that to your journal",
    body: "Your discovery is still here. Let’s try again!",
  },
};

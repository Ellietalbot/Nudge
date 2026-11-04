import { NudgeErrorKind } from "./nudge-api";

export const ERROR_COPY: Record<
  NudgeErrorKind,
  { title: string; body: string }
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
};

# Nudge design system (React Native)

The approved Nudge design system, ported to Expo SDK 57 / React Native 0.86 with `StyleSheet`.
Everything is imported from one place:

```tsx
import { Button, NudgeBubble, QuickReplies, palette, steps } from '@/design-system';
```

Open the in-app preview at **`/design-system`** (`src/app/design-system.tsx`) to see every component
on a real phone. Delete that route before release if you don't want it shipped.

## 1. Install the three new dependencies

```bash
npx expo install react-native-svg expo-speech @expo-google-fonts/figtree
```

`expo-font` is already in the project. `react-native-svg` and `expo-speech` are included in Expo Go,
so no development build is needed.

## 2. Load Figtree in the root layout

In `src/app/_layout.tsx`, load the fonts before hiding the splash screen:

```tsx
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useNudgeFonts } from '@/design-system';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded, fontError] = useNudgeFonts();
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  // …the existing ThemeProvider / tabs
}
```

## 3. Tabs

The app has three places: **Explore**, **Journal** and **Grown-ups** (behind the PIN). Use
`tabColors` from `Navigation.tsx` for `NativeTabs` (`indicatorColor={tabColors.active}`,
`backgroundColor={tabColors.bar}`). The template's "Home" tab can go.

## What's in here

| File | What it holds |
|---|---|
| `tokens.ts` | Colours, the 5 steps, status colours, type scale, spacing, radii, shadows, focus ring, `hitSlopFor` |
| `fonts.ts` | `useNudgeFonts()` |
| `icons.tsx`, `stepIcons.ts` | 24px stroke icons (react-native-svg) and the icon for each step |
| `Text.tsx` | `Text` with `variant`: display, heading, title, reading, button, chip, body, label, caption |
| `Button.tsx` | `Button`: primary / secondary / quiet, md / lg, square tool buttons, not-ready state |
| `Chips.tsx` | `StepChip`, `PraisePill`, `FoundItOut`, `Tag` |
| `TextField.tsx` | One text field for everything a child writes (starter, Nudge hint, app problem) |
| `Guess.tsx` | `WordTile`, `BlankSlot`, `HypothesisBuilder`, `AnswerCards` |
| `PromptCard.tsx` | `PromptCard` and `answerMethod` (how a child answers each step) |
| `Progress.tsx` | `StepPath`, `AdventureProgress`, `StepProgress` |
| `Navigation.tsx` | `BackLink`, `TopBar`, `tabColors` |
| `Chat.tsx` | `NudgeAvatar`, `NudgeBubble`, `ChildBubble`, `PhotoBubble`, `TypingIndicator`, `StepDivider` |
| `QuickReplies.tsx` | Quick replies after Nudge asks something |
| `ConfidenceBubble.tsx` | How sure Nudge is, in words, colour and a sure-o-meter |
| `AIDisclosure.tsx` | First-launch intro and the line at the top of every chat (FR13) |
| `ReadAloudButton.tsx` | "Read to me" with expo-speech |
| `Feedback.tsx` | `GotIt`, `useGotIt()`, `ProblemToast` |
| `SafetyCard.tsx` | The 5 safety messages |
| `States.tsx` | `EmptyState`, `ErrorState`, `Skeleton`, `SkeletonCard` |
| `Paper.tsx` | `GraphPaper`, `Tape`, `DoodlePattern`, `SunStar` |
| `Journal.tsx` | `JournalCover`, `JournalEntryRow`, `JournalEntryPreview`, `FindingCard`, `DiscoveryCount`, `ExplorerStickers` |
| `Investigation.tsx` | `InvestigationCard`, `MaterialsList`, `ExperimentStep`, `TickBox` |

## Rules to keep when building screens

- **Colour:** step colours show *where you are*. They are never used on buttons or for status.
  Navy means "do this / selected". Sunny yellow means "celebrate" or "safety", with navy on it only.
- **Shadows:** the press shadow is only for things you can tap.
- **Buttons:** one navy primary per screen, full width at the bottom.
- **Text:** reading text is 19px. Nothing below 14px. No italics, no all-caps. Never fixed-height
  boxes around text, because kids' phones often have large text turned on.
- **Taps:** everything tappable has a 76pt hit area (`hitSlopFor`), a screen-reader label and the focus ring.
- **No grading:** praise what the child did ("Brave guess!"), never right or wrong.
- **App problems:** calm and never the child's fault ("The camera didn't start. Try again").
- **Quick replies** (for the AI system prompt): at most 3, in the child's voice, one moves to the next
  step, "I'm not sure" is always there, no emoji.

## Not ported yet

These sections of the web design system are still waiting for design decisions:
AI status states, camera result screen, form controls (toggles/checkbox/radio), avatars,
topic chips, discovery header and compare cards, onboarding, the offline screen, the
Go Investigate screen.

import { useGotIt } from "@/design-system";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

/**
 * Shows a GotIt when a screen is opened with a `gotIt` param, so the message
 * from finishing one step appears on the next screen. Pass the result to
 * <Screen overlay={…}>. `gotItAt` (a timestamp) lets a tab screen that stays
 * mounted, like the journal, show the same message again next time.
 *
 *   router.push({ pathname: "/explore/reflect", params: gotItParams("Experiment done!") });
 */
export function useGotItFromParams() {
  const { gotIt, gotItAt } = useLocalSearchParams<{
    gotIt?: string;
    gotItAt?: string;
  }>();
  const { show, element } = useGotIt();
  useEffect(() => {
    if (gotIt) show(gotIt);
  }, [gotIt, gotItAt, show]);
  return element;
}

export function gotItParams(message: string) {
  return { gotIt: message, gotItAt: String(Date.now()) };
}

import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  // Hide the tab bar once an exploration starts (camera, Observe, Ask, …),
  // so the child stays in the loop. "/explore" itself keeps it.
  const inExploration = usePathname().startsWith("/explore/");

  return (
    <NativeTabs
      hidden={inExploration}
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="grown-ups">
        <NativeTabs.Trigger.Label>Grown Ups</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="lock.fill" md="lock" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

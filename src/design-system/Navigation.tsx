/**
 * Getting around.
 *   BackLink   quiet: an arrow and an underlined word, never a raised button.
 *   TopBar     Back on the left, compact step progress on the right.
 *   tabColors  colours for the app's bottom tabs.
 *
 * Tabs: the app's NativeTabs (expo-router/unstable-native-tabs) should have exactly three
 * tabs: Explore (compass), Journal (open book) and Grown-ups (lock, behind the grown-up PIN).
 * Active tab = navy pill behind a white icon with a navy label; inactive = muted navy.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconArrowLeft } from './icons';
import { StepProgress } from './Progress';
import { Text } from './Text';
import { focusRing, hitSlopFor, palette, radius, space } from './tokens';

const backH = 48;

export function BackLink({ label = 'Back', onPress }: { label?: string; onPress?: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(backH)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }, focused && focusRing]}
    >
      <IconArrowLeft size={22} color={palette.navy} />
      <Text variant="button" style={styles.underline}>{label}</Text>
    </Pressable>
  );
}

export function TopBar({ onBack, current }: { onBack?: () => void; current: number }) {
  return (
    <View style={styles.bar}>
      <BackLink onPress={onBack} />
      <StepProgress current={current} />
    </View>
  );
}

/** Bottom tab colours (use with NativeTabs: Explore, Journal, Grown-ups behind PIN). */
export const tabColors = {
  /** Pill behind the active tab's icon. */
  active: palette.navy,
  activeIcon: palette.white,
  activeLabel: palette.navy,
  inactive: palette.navyMuted,
  bar: palette.paper,
  border: palette.sand,
} as const;

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    height: backH, paddingLeft: space[1], paddingRight: space[3], borderRadius: radius.pill,
  },
  underline: { textDecorationLine: 'underline' },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3],
    paddingHorizontal: space[4], paddingVertical: space[2],
  },
});

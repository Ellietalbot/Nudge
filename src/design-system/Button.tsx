/**
 * Buttons: three roles, two sizes.
 *   primary   navy, one per screen, the next step (full width at the bottom)
 *   secondary sand, another real choice
 *   quiet     underlined text: skip, back, not now
 * Step colours are never used on buttons.
 *
 * Square buttons are "tool buttons" (Talk, Photo) and always show a word underneath.
 * A not-ready button stays focusable, looks flat and dashed, and says why underneath.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { focusRing, hitSlopFor, palette, radius, shadow, size as sizes, space } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

const look = {
  primary: { bg: palette.navy, fg: palette.white, press: palette.navyPress },
  secondary: { bg: palette.sand, fg: palette.navy, press: palette.sandPress },
  quiet: { bg: 'transparent', fg: palette.navy, press: 'transparent' },
} as const;

export type ButtonProps = {
  /** Button text. For square tool buttons this is the caption under the button. */
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  /** Icon before the label (render prop gets the right colour and size). */
  icon?: (p: { color: string; size: number }) => React.ReactNode;
  /** Square tool button with the label as a caption underneath. */
  square?: boolean;
  /** Not ready yet: stays focusable, looks flat, and shows `reason`. */
  disabled?: boolean;
  reason?: string;
  fullWidth?: boolean;
  /** Screen-reader name when it should differ from `label`. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label, onPress, variant = 'primary', size = 'md', icon, square, disabled, reason, fullWidth, accessibilityLabel, style,
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const c = look[variant];
  const h = size === 'lg' ? sizes.large : sizes.medium;
  const quiet = variant === 'quiet';
  const iconSize = size === 'lg' ? 26 : 22;
  const fg = disabled ? palette.navyMuted : c.fg;

  const button = (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(h)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={disabled ? reason : undefined}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        { height: h, borderRadius: radius.pill },
        square ? { width: h } : { paddingHorizontal: size === 'lg' ? space[8] : space[6] },
        fullWidth && !square && { alignSelf: 'stretch' },
        disabled
          ? styles.disabled
          : quiet
            ? { opacity: pressed ? 0.7 : 1 }
            : {
                backgroundColor: c.bg,
                boxShadow: pressed ? undefined : shadow.press(c.press),
                transform: [{ translateY: pressed ? 5 : 0 }],
              },
        focused && focusRing,
        !reason && !square && style,
      ]}
    >
      {icon?.({ color: fg, size: iconSize })}
      {!square && (
        <Text variant="button" color={fg} style={quiet && styles.underline} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );

  if (!square && !(disabled && reason)) return button;
  return (
    <View style={[styles.wrap, square ? { alignItems: 'center' } : fullWidth && { alignSelf: 'stretch' }, style]}>
      {button}
      {square && <Text variant="label" align="center" importantForAccessibility="no">{label}</Text>}
      {disabled && reason && <Text variant="label" color={palette.navyMuted} align="center" style={styles.reason}>{reason}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] + 2 },
  disabled: { backgroundColor: 'transparent', borderWidth: 2.5, borderStyle: 'dashed', borderColor: palette.sandPress },
  underline: { textDecorationLine: 'underline' },
  wrap: { gap: space[2] },
  reason: { fontFamily: 'Figtree_500Medium' },
});

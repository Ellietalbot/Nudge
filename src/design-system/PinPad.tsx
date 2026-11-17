/**
 * PinPad: the local unlock for the Grown-ups area (FR11). Ported from the web design system.
 * 4 dots, a 3×4 keypad, a wrong-PIN message with tries left, and a locked state.
 * The pad is display-only: the screen owns the digits, the tries count and the lockout.
 * Parent screens use 56px+ targets: these are adult controls, but still easy to hit.
 *
 *   <PinPad title="Grown-ups" subtitle="Enter your 4-digit PIN" digits={pin.length}
 *     state="wrong" triesLeft={3} onDigit={…} onBack={…} onCancel={…} />
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { IconBackspace, IconLock } from './icons';
import { Text } from './Text';
import { useReduceMotion } from './useReduceMotion';
import { focusRing, palette, radius, space, status } from './tokens';

export type PinPadState = 'entry' | 'wrong' | 'locked';

export type PinPadProps = {
  title?: string;
  subtitle?: string;
  state?: PinPadState;
  /** How many digits are entered (0–4). */
  digits: number;
  triesLeft?: number;
  /** Shown in the locked state, e.g. "Too many tries. Try again in 1 minute." */
  lockedMessage?: string;
  /** Overrides the wrong-PIN message (e.g. "Those PINs didn't match." while setting one up). */
  wrongMessage?: string;
  onDigit: (d: string) => void;
  onBack: () => void;
  onCancel: () => void;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const KEY_W = 80;
const KEY_H = 64;

export function PinPad({
  title = 'Grown-ups',
  subtitle = 'Enter your 4-digit PIN',
  state = 'entry',
  digits,
  triesLeft,
  lockedMessage = 'Too many tries. Try again in 1 minute.',
  wrongMessage,
  onDigit,
  onBack,
  onCancel,
}: PinPadProps) {
  const locked = state === 'locked';
  const shake = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  // Shake the dots on a wrong PIN, like the web version (skipped with Reduce Motion).
  useEffect(() => {
    if (state !== 'wrong' || reduceMotion) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -6, duration: 75, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 150, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 75, useNativeDriver: true }),
    ]).start();
  }, [state, triesLeft, reduceMotion, shake]);

  let message: string | null = null;
  if (state === 'wrong') {
    message = wrongMessage
      ?? `That PIN didn't match.${triesLeft != null ? ` ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left.` : ''}`;
  } else if (locked) {
    message = lockedMessage;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.lock}>
        <IconLock size={24} color={palette.navy} />
      </View>
      <Text variant="title" align="center">{title}</Text>
      <Text variant="body" align="center" color={palette.navyMuted}>{subtitle}</Text>

      <Animated.View
        style={[styles.dots, { transform: [{ translateX: shake }] }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${digits} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, i < digits && styles.dotOn]} />
        ))}
      </Animated.View>

      <View style={styles.msg} accessibilityLiveRegion="assertive">
        {message && (
          <View style={styles.notice} accessible accessibilityRole="alert" accessibilityLabel={message}>
            <Text variant="body" color={status.problem.text} align="center">{message}</Text>
          </View>
        )}
      </View>

      <View style={styles.pad} accessibilityLabel="Keypad">
        {KEYS.map(k => (
          <Key key={k} label={k} disabled={locked} onPress={() => onDigit(k)} />
        ))}
        <Key label="Cancel" text onPress={onCancel} />
        <Key label="0" disabled={locked} onPress={() => onDigit('0')} />
        <Key label="Delete last digit" text icon disabled={locked} onPress={onBack} />
      </View>
    </View>
  );
}

function Key({ label, onPress, disabled, text, icon }: {
  label: string; onPress: () => void; disabled?: boolean; text?: boolean; icon?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.key,
        text && styles.keyText,
        pressed && !disabled && styles.keyPressed,
        disabled && styles.keyDisabled,
        focused && focusRing,
      ]}
    >
      {icon ? (
        <IconBackspace size={24} color={palette.navy} />
      ) : (
        <Text variant={text ? 'caption' : 'title'}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space[3] },
  lock: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.paper,
  },
  dots: { flexDirection: 'row', gap: space[4], paddingVertical: space[2] },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: palette.navy },
  dotOn: { backgroundColor: palette.navy },
  msg: { minHeight: 24, alignSelf: 'stretch', alignItems: 'center' },
  notice: {
    backgroundColor: status.problem.bg,
    borderColor: status.problem.edge,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  },
  pad: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    width: KEY_W * 3 + space[3] * 2, gap: space[3],
  },
  key: {
    width: KEY_W, height: KEY_H, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.white, borderWidth: 2, borderColor: palette.edge,
  },
  keyText: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyPressed: { backgroundColor: palette.paper },
  keyDisabled: { opacity: 0.45 },
});

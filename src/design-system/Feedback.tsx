/**
 * Feedback: quick messages after something happens.
 *
 *   GotIt         success. Navy pill with a teal check. Says what was saved, never grades.
 *   useGotIt      shows a GotIt at the top for about 2 seconds, then fades away.
 *   ProblemToast  the app hiccuped. Calm sand box, never blames the child, always offers
 *                 the way forward ("Try again").
 *
 * Status never reuses step colours: success is navy, problems are sand.
 * (The teal check circle is the one sanctioned exception carried over from the web design.)
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';

import { IconAlertTriangle, IconCheck, type IconProps } from './icons';
import { Text } from './Text';
import { useReduceMotion } from './useReduceMotion';
import { focusRing, fontFamily, hitSlopFor, palette, radius, shadow, space, status } from './tokens';

const checkCircle = '#B0D4D4';

// ── Got it ────────────────────────────────────────────────────────────────────

export type GotItProps = { message: string };

export function GotIt({ message }: GotItProps) {
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={styles.gotIt}
    >
      <View style={styles.gotItCheck}>
        <IconCheck size={18} color={palette.navy} />
      </View>
      <Text variant="reading" color={palette.white} style={styles.gotItText}>
        {message}
      </Text>
    </View>
  );
}


const GOT_IT_MS = 2000;
const FADE_MS = 200;

/**
 * Shows a GotIt at the top of the screen for about 2 seconds.
 * Render `element` once near the root of the screen, then call `show('Saved to your journal!')`.
 * The message is also announced to screen readers. With Reduce Motion on, it appears and
 * disappears without fading.
 */
export function useGotIt() {
  const reduceMotion = useReduceMotion();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    opacity.stopAnimation();
    setMessage(next);
    AccessibilityInfo.announceForAccessibility(next);

    const hide = () => setMessage(null);
    if (reduceMotion) {
      opacity.setValue(1);
      timer.current = setTimeout(hide, GOT_IT_MS);
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(({ finished }) => {
        if (finished) hide();
      });
    }, GOT_IT_MS);
  }, [opacity, reduceMotion]);

  const element = message ? (
    <Animated.View pointerEvents="none" style={[styles.gotItHost, { opacity }]}>
      <GotIt message={message} />
    </Animated.View>
  ) : null;

  return { show, element };
}

// ── Problem toast ─────────────────────────────────────────────────────────────

export type ProblemToastProps = {
  /** Calm, kid-friendly, never the child's fault. E.g. "The camera is taking a nap." */
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Icon component for the tile. IconAlertTriangle (default), IconCameraOff, IconCloudOff. */
  icon?: (p: IconProps) => React.ReactElement;
};

export function ProblemToast({ message, actionLabel = 'Try again', onAction, icon: Icon = IconAlertTriangle }: ProblemToastProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast}>
      <View style={styles.toastTile}>
        <Icon size={20} color={palette.navy} />
      </View>
      <View style={styles.toastBody}>
        <Text variant="body" style={styles.toastMessage}>{message}</Text>
        {onAction && (
          <Pressable
            onPress={onAction}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            hitSlop={hitSlopFor(24)}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => [styles.toastAction, pressed && { opacity: 0.7 }, focused && focusRing]}
          >
            <Text variant="body" style={styles.toastActionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gotIt: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: space[2] + 2,
    backgroundColor: palette.navy,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: '100%',
  },
  gotItCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: checkCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: { fontFamily: fontFamily[700], flexShrink: 1 },
  gotItHost: {
    position: 'absolute',
    top: space[12],
    left: space[4],
    right: space[4],
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
    boxShadow: shadow.floating,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: status.problem.bg,
    borderWidth: 2,
    borderColor: status.problem.edge,
  },
  toastTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: status.problem.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBody: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space[2] },
  toastMessage: { fontFamily: fontFamily[700], color: status.problem.text },
  toastAction: { borderRadius: 6 },
  toastActionText: {
    fontFamily: fontFamily[800],
    color: status.problem.text,
    textDecorationLine: 'underline',
  },
});

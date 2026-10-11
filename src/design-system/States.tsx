/**
 * Screen states: empty, error and loading.
 *
 *   EmptyState    nothing here yet. Friendly, dashed paper box, one clear next step.
 *   ErrorState    the app hiccuped. Same calm sand "problem" look as ProblemToast.
 *                 Never the child's fault, and their work is always safe.
 *                 Default copy:
 *                   title: "Your journal didn't load"
 *                   body:  "Nudge couldn't reach the internet. Your discoveries are safe."
 *   Skeleton      a soft shimmering placeholder while things load (still if Reduce Motion is on).
 *   SkeletonCard  a placeholder shaped like a journal card.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

import { Button } from './Button';
import { IconCloudOff } from './icons';
import { Text } from './Text';
import { useReduceMotion } from './useReduceMotion';
import { palette, radius, space, status } from './tokens';

const dashedEdge = 'rgba(0, 54, 98, 0.18)';

// ── Empty state ───────────────────────────────────────────────────────────────

export type EmptyStateProps = {
  title: string;
  body: string;
  /** Illustration or icon tile shown above the title. */
  illustration?: React.ReactNode;
  /** One primary next step. */
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, body, illustration, action }: EmptyStateProps) {
  return (
    <View style={[styles.box, styles.empty]}>
      {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
      <Text variant="title" align="center" style={styles.title}>{title}</Text>
      <Text variant="reading" color={palette.navyMuted} align="center" style={styles.body}>{body}</Text>
      {action && <Button label={action.label} onPress={action.onPress} variant="primary" />}
    </View>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

export type ErrorStateProps = {
  /** e.g. "Your journal didn't load" */
  title: string;
  /** e.g. "Nudge couldn't reach the internet. Your discoveries are safe." */
  body: string;
  onRetry?: () => void;
};

export function ErrorState({ title, body, onRetry }: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.box, styles.error]}>
      <View style={styles.errorTile}>
        <IconCloudOff size={36} color={palette.navy} />
      </View>
      <Text variant="title" align="center" style={styles.title}>{title}</Text>
      <Text variant="reading" color={palette.navyMuted} align="center" style={styles.body}>{body}</Text>
      {onRetry && <Button label="Try again" onPress={onRetry} variant="primary" />}
    </View>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────


export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

export function Skeleton({ width = '100%', height = 16, radius: r = radius.md }: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width, height, borderRadius: r, backgroundColor: palette.sand, opacity }}
    />
  );
}

export function SkeletonCard() {
  return (
    <View accessible accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={40} height={40} radius={12} />
        <View style={styles.skeletonLines}>
          <Skeleton width="75%" height={16} />
          <Skeleton width="50%" height={12} />
        </View>
      </View>
      <Skeleton height={72} />
      <Skeleton width="66%" height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingVertical: space[12],
    paddingHorizontal: space[6],
    borderRadius: radius.xxl,
    borderWidth: 2,
  },
  empty: { backgroundColor: palette.paper, borderStyle: 'dashed', borderColor: dashedEdge },
  error: { backgroundColor: status.problem.bg, borderColor: status.problem.edge },
  illustration: { marginBottom: space[5] },
  errorTile: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: status.problem.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[5],
  },
  title: { marginBottom: space[2] },
  body: { maxWidth: 320, marginBottom: space[6] },
  skeletonCard: {
    gap: space[3],
    padding: space[5],
    borderRadius: radius.xl,
    backgroundColor: palette.paper,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 54, 98, 0.08)',
  },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  skeletonLines: { flex: 1, gap: space[2] },
});

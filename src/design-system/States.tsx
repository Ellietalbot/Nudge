import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";

import { Button } from "./Button";
import { Illustration } from "./Illustration";
import { Text } from "./Text";
import { palette, radius, space, status } from "./tokens";
import { useReduceMotion } from "./useReduceMotion";

const dashedEdge = "rgba(0, 54, 98, 0.18)";

export type EmptyStateProps = {
  title: string;
  body: string;
  illustration?: React.ReactNode;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({
  title,
  body,
  illustration,
  action,
}: EmptyStateProps) {
  return (
    <View style={[styles.box, styles.empty]}>
      {illustration ? (
        <View style={styles.illustration}>{illustration}</View>
      ) : null}
      <Text variant="title" align="center" style={styles.title}>
        {title}
      </Text>
      <Text
        variant="reading"
        color={palette.navyMuted}
        align="center"
        style={styles.body}
      >
        {body}
      </Text>
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
        />
      )}
    </View>
  );
}

export type ErrorStateProps = {
  title: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  body,
  retryLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.box, styles.error]}
    >
      <View style={styles.illustration}>
        <Illustration name="robotHolding" size={112} />
      </View>
      <Text variant="title" align="center" style={styles.title}>
        {title}
      </Text>
      <Text
        variant="reading"
        color={palette.navyMuted}
        align="center"
        style={styles.body}
      >
        {body}
      </Text>
      {onRetry && (
        <Button label={retryLabel} onPress={onRetry} variant="primary" />
      )}
    </View>
  );
}

export type ThinkingStateProps = {
  title?: string;
};

export function ThinkingState({
  title = "Nudge is thinking…",
}: ThinkingStateProps) {
  return (
    <View
      accessible
      accessibilityLabel={title}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      style={[styles.box, styles.thinking]}
    >
      <View style={styles.illustration}>
        <Illustration name="robotThinking" size={120} />
      </View>
      <Text variant="title" align="center">
        {title}
      </Text>
    </View>
  );
}

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius: r = radius.md,
}: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width,
        height,
        borderRadius: r,
        backgroundColor: palette.sand,
        opacity,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <View
      accessible
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
      style={styles.skeletonCard}
    >
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
    alignItems: "center",
    paddingVertical: space[12],
    paddingHorizontal: space[6],
    borderRadius: radius.xxl,
    borderWidth: 2,
  },
  empty: {
    backgroundColor: palette.paper,
    borderStyle: "dashed",
    borderColor: dashedEdge,
  },
  error: {
    backgroundColor: status.problem.bg,
    borderColor: status.problem.edge,
  },
  thinking: {
    backgroundColor: palette.paper,
    borderColor: "rgba(0, 54, 98, 0.08)",
  },
  illustration: { marginBottom: space[5] },
  title: { marginBottom: space[2] },
  body: { maxWidth: 320, marginBottom: space[6] },
  skeletonCard: {
    gap: space[3],
    padding: space[5],
    borderRadius: radius.xl,
    backgroundColor: palette.paper,
    borderWidth: 1.5,
    borderColor: "rgba(0, 54, 98, 0.08)",
  },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: space[3] },
  skeletonLines: { flex: 1, gap: space[2] },
});

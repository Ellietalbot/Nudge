/**
 * SafetyCard: every safety message shares ONE look so a child learns
 * "yellow box = stop and listen". Sunny header, navy edge, paper body.
 * The icon and the words say how serious it is, never the colour.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconAlertTriangle, IconHandStop, IconShield, IconStop, IconUserCheck, type IconProps } from './icons';
import { Text } from './Text';
import { fontFamily, space, status } from './tokens';

export type SafetyLevel = 'caution' | 'askAdult' | 'doNotTouch' | 'unsafe' | 'stop';

export const safetyConfig: Record<SafetyLevel, { label: string; body: string; Icon: (p: IconProps) => React.ReactElement }> = {
  caution: { label: 'Be careful!', body: 'This might be tricky. Go slowly and pay attention.', Icon: IconAlertTriangle },
  askAdult: { label: 'Ask a grown-up first!', body: 'Get help from an adult before you try this.', Icon: IconUserCheck },
  doNotTouch: { label: "Don't touch!", body: "Look but don't touch. It could hurt you.", Icon: IconHandStop },
  unsafe: { label: 'Not safe to try', body: "This experiment is too dangerous. Let's find another way.", Icon: IconShield },
  stop: { label: 'Stop the investigation', body: "Stop what you're doing and tell a grown-up straight away.", Icon: IconStop },
};

export type SafetyCardProps = {
  level: SafetyLevel;
  /** Header only (no body), smaller radius. */
  compact?: boolean;
};

export function SafetyCard({ level, compact = false }: SafetyCardProps) {
  const c = safetyConfig[level];
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={compact ? c.label : `${c.label} ${c.body}`}
      style={[styles.card, { borderRadius: compact ? 20 : 24 }]}
    >
      <View style={[styles.header, compact ? styles.headerCompact : styles.headerFull]}>
        <c.Icon size={24} color={status.safety.text} />
        <Text variant="reading" color={status.safety.text} style={styles.label}>{c.label}</Text>
      </View>
      {!compact && (
        <View style={styles.body}>
          <Text variant="reading" color={status.safety.text}>{c.body}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: 2.5, borderColor: status.safety.edge, backgroundColor: status.safety.body },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: status.safety.bg },
  headerFull: { paddingHorizontal: space[5], paddingVertical: 14 },
  headerCompact: { paddingHorizontal: space[4], paddingVertical: space[3] },
  label: { fontFamily: fontFamily[800], flexShrink: 1 },
  body: { paddingHorizontal: space[5], paddingVertical: space[4], backgroundColor: status.safety.body },
});

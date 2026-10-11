/**
 * Nudge says how sure it is, in kid words AND colour, plus a "sure-o-meter" (filled dots),
 * so the meaning never rests on colour alone. Nudge never acts all-knowing.
 *   confident  "I'm sure!"         teal      3 dots
 *   likely     "I think so"        coral     2 dots
 *   unsure     "I'm not sure yet"  lavender  1 dot
 *   needsMore  "Show me more?"     sand      0 dots (asks for another photo)
 * Not tappable, so no press shadow.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NudgeAvatar, plainText } from './Chat';
import { IconCamera, IconCheck, IconLightbulb, IconQuestion, type IconProps } from './icons';
import { Text } from './Text';
import { fontFamily, palette, space } from './tokens';

export type ConfidenceLevel = 'confident' | 'likely' | 'unsure' | 'needsMore';

const config: Record<ConfidenceLevel, { label: string; dots: number; bg: string; pale: string; Icon: (p: IconProps) => React.ReactElement }> = {
  confident: { label: "I'm sure!", dots: 3, bg: '#B0D4D4', pale: '#E2EFEF', Icon: IconCheck },
  likely: { label: 'I think so', dots: 2, bg: '#E89979', pale: '#F9E5DC', Icon: IconLightbulb },
  unsure: { label: "I'm not sure yet", dots: 1, bg: '#B5AFF5', pale: '#ECEAFD', Icon: IconQuestion },
  needsMore: { label: 'Show me more?', dots: 0, bg: palette.sand, pale: palette.cream, Icon: IconCamera },
};

export type ConfidenceBubbleProps = {
  level: ConfidenceLevel;
  children: React.ReactNode;
};

export function ConfidenceBubble({ level, children }: ConfidenceBubbleProps) {
  const c = config[level];
  return (
    <View style={styles.row}>
      <NudgeAvatar />
      <View
        style={[styles.bubble, level === 'needsMore' && styles.bordered]}
        accessible
        accessibilityLabel={`Nudge says, ${c.label} ${plainText(children)}`}
      >
        <View style={[styles.header, { backgroundColor: c.bg }]}>
          <c.Icon size={18} color={palette.navy} />
          <Text variant="body" style={styles.label}>{c.label}</Text>
          <View style={styles.meter}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, i < c.dots && styles.dotFilled]} />
            ))}
          </View>
        </View>
        <View style={[styles.body, { backgroundColor: c.pale }]}>
          {typeof children === 'string' || typeof children === 'number' ? <Text variant="reading">{children}</Text> : children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bubble: { maxWidth: '85%', flexShrink: 1, borderRadius: 22, borderTopLeftRadius: 6, overflow: 'hidden' },
  bordered: { borderWidth: 1.5, borderColor: '#D3CCBF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space[4], paddingVertical: space[2] },
  label: { fontFamily: fontFamily[800], flexShrink: 1 },
  meter: { flexDirection: 'row', gap: space[1], marginLeft: 'auto', paddingLeft: space[2] },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: palette.navy },
  dotFilled: { backgroundColor: palette.navy },
  body: { paddingHorizontal: space[5], paddingVertical: space[4] },
});

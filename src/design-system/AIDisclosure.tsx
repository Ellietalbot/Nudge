/**
 * Tells the child Nudge is a computer, not a person. Same words everywhere:
 * "computer helper, not a person", and Nudge can make mistakes.
 *   Full     first launch: Nudge's face, three short lines, Read to me, "Let's explore!"
 *   Compact  a quiet line at the top of every chat; "What's that?" opens the full intro again
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { IconChip, IconCompass, IconInfo, IconQuestion, IconSprout, IconUserCheck, type IconProps } from './icons';
import { ReadAloudButton } from './ReadAloudButton';
import { Text } from './Text';
import { focusRing, fontFamily, hairline, hitSlopFor, nudgeBubble, palette, radius, space } from './tokens';

const lines: { Icon: (p: IconProps) => React.ReactElement; text: string }[] = [
  { Icon: IconChip, text: "I'm a computer helper, not a person." },
  { Icon: IconQuestion, text: 'I ask questions to help you think.' },
  { Icon: IconUserCheck, text: 'I can make mistakes. If something feels weird, tell a grown-up.' },
];

const HEADING = "Hi! I'm Nudge.";
const COMPACT_LINE = 'Nudge is a computer helper, not a person.';

export type AIDisclosureProps = {
  compact?: boolean;
  /** Compact only: "What's that?" (open the full intro). */
  onMore?: () => void;
  /** Full only: "Let's explore!" */
  onDone?: () => void;
};

export function AIDisclosure({ compact = false, onMore, onDone }: AIDisclosureProps) {
  if (compact) return <CompactLine onMore={onMore} />;
  return (
    <View style={styles.card}>
      <View style={styles.face} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <IconSprout size={44} color={palette.navy} />
      </View>
      <Text variant="heading" align="center" style={styles.heading}>{HEADING}</Text>
      <View style={styles.list}>
        {lines.map(l => (
          <View key={l.text} style={styles.line}>
            <View style={styles.tile}>
              <l.Icon size={20} color={palette.navy} />
            </View>
            <Text variant="reading" style={styles.lineText}>{l.text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.readAloud}>
        <ReadAloudButton text={`${HEADING} ${lines.map(l => l.text).join(' ')}`} />
      </View>
      <Button
        label="Let's explore!"
        size="lg"
        fullWidth
        onPress={onDone}
        icon={({ color, size }) => <IconCompass size={size} color={color} />}
      />
    </View>
  );
}

function CompactLine({ onMore }: { onMore?: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.compact}>
      <View style={styles.compactInfo} accessible accessibilityLabel={COMPACT_LINE}>
        <IconInfo size={18} color={palette.navyMuted} />
        <Text variant="label" color={palette.navyMuted} align="center">{COMPACT_LINE}</Text>
      </View>
      <Pressable
        onPress={onMore}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        hitSlop={hitSlopFor(24)}
        accessibilityRole="button"
        accessibilityLabel="What's that?"
        accessibilityHint="Tells you more about Nudge"
        style={({ pressed }) => [styles.more, { opacity: pressed ? 0.7 : 1 }, focused && focusRing]}
      >
        <Text variant="label" style={styles.moreText}>What's that?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    backgroundColor: palette.paper,
    borderWidth: 1.5,
    borderColor: hairline,
    borderRadius: radius.xxl,
    paddingHorizontal: space[6],
    paddingVertical: 28,
  },
  face: { width: 84, height: 84, borderRadius: 26, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center' },
  heading: { marginVertical: 14 },
  list: { alignSelf: 'stretch', gap: space[3] },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  tile: { width: 36, height: 36, borderRadius: 12, backgroundColor: nudgeBubble, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lineText: { flex: 1, paddingTop: 3 },
  readAloud: { marginVertical: space[4] },

  compact: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: space[2], rowGap: space[1] },
  compactInfo: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexShrink: 1 },
  more: { borderRadius: 6, paddingHorizontal: 2 },
  moreText: { fontFamily: fontFamily[800], textDecorationLine: 'underline' },
});

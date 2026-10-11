/**
 * Small flat labels. None of these are tappable, so none have a press shadow.
 *   StepChip     "Observe" – which step a card belongs to
 *   PraisePill   "Brave guess!" – names what the child did (never right/wrong)
 *   FoundItOut   solid sunny "Found it out!" for finished discoveries
 *   Tag          time (sand) or safety (sunny) tags on the investigation card
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconHandStop, IconStar, IconTimer, IconUserCheck, type IconProps } from './icons';
import { Text } from './Text';
import { palette, radius, space, step as getStep, stepChip, type StepId } from './tokens';
import { stepIcon } from './stepIcons';

export function StepChip({ stepId, label }: { stepId: StepId; label?: string }) {
  const s = getStep(stepId);
  const c = stepChip(s);
  const Icon = stepIcon[stepId];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg, borderColor: c.border ?? c.bg }]}>
      <Icon size={18} color={c.fg} />
      <Text variant="chip" color={c.fg}>{label ?? s.label}</Text>
    </View>
  );
}

export const praiseLines: Record<StepId, string> = {
  observe: 'Great noticing!',
  ask: 'Ooh, good question!',
  hypothesize: 'Brave guess!',
  investigate: 'You tested it!',
  reflect: 'You figured it out!',
};

/** Cream pill with the step's colour in a circle behind the icon. */
export function PraisePill({ stepId, label }: { stepId: StepId; label?: string }) {
  const s = getStep(stepId);
  const Icon = stepIcon[stepId];
  return (
    <View style={styles.praise}>
      <View style={[styles.circle, { backgroundColor: s.bg }]}>
        <Icon size={18} color={s.fg} />
      </View>
      <Text variant="body" style={styles.bold}>{label ?? praiseLines[stepId]}</Text>
    </View>
  );
}

export function FoundItOut({ large }: { large?: boolean }) {
  return (
    <View style={[styles.found, large && styles.foundLg]}>
      <IconStar size={large ? 18 : 16} color={palette.navy} />
      <Text variant={large ? 'button' : 'label'} style={styles.bold} numberOfLines={1}>Found it out!</Text>
    </View>
  );
}

type TagKind = 'time' | 'safety';
const tagIcon: Record<string, (p: IconProps) => React.ReactElement> = { time: IconTimer, touch: IconHandStop, adult: IconUserCheck };

/** `kind="time"` is neutral sand; `kind="safety"` is sunny with navy. */
export function Tag({ kind, icon = kind === 'time' ? 'time' : 'touch', children }: { kind: TagKind; icon?: 'time' | 'touch' | 'adult'; children: string }) {
  const Icon = tagIcon[icon];
  return (
    <View style={[styles.tag, { backgroundColor: kind === 'safety' ? palette.sunny : palette.sand }]}>
      <Icon size={16} color={palette.navy} />
      <Text variant="label">{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: radius.pill, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 4 },
  praise: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: space[2], backgroundColor: palette.paper, borderRadius: radius.pill, paddingLeft: 6, paddingRight: 14, paddingVertical: 6 },
  circle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bold: { fontFamily: 'Figtree_800ExtraBold' },
  found: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', flexShrink: 0, gap: 6, backgroundColor: palette.sunny, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  foundLg: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
});

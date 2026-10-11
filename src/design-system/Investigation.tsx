/**
 * The Investigate card: what you need (tap to tick), what to do (tap each step when it's
 * done), then "I did it! Tell Nudge".
 *
 * Ticked = navy box with a white tick. Words stay readable: no strike-through, which is
 * hard for new readers. Emoji are a reading aid and hidden from screen readers.
 * Rows are tappable but use a hairline border, not a press shadow.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type TextStyle } from 'react-native';

import { Button } from './Button';
import { StepChip, Tag } from './Chips';
import { IconCheck, IconLightbulb } from './icons';
import { Text } from './Text';
import { focusRing, fontFamily, hairline, hitSlopFor, nudgeBubble, palette, radius, space, step as getStep } from './tokens';

const inv = getStep('investigate');

function f(weight: keyof typeof fontFamily, fontSize: number, lineHeight: number): TextStyle {
  return { fontFamily: fontFamily[weight], fontSize, lineHeight };
}

/** Controlled when `onToggle` is given, otherwise keeps its own state. */
function useToggle(value: boolean | undefined, onToggle: (() => void) | undefined) {
  const [own, setOwn] = useState(!!value);
  return onToggle ? ([!!value, onToggle] as const) : ([own, () => setOwn(v => !v)] as const);
}

function useFocus() {
  const [focused, setFocused] = useState(false);
  return { focused, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

// ── Tick box ─────────────────────────────────────────────────────────────────

export function TickBox({ on }: { on: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tick, on ? styles.tickOn : styles.tickOff]}
    >
      {on && <IconCheck size={18} color={palette.white} />}
    </View>
  );
}

// ── Materials ────────────────────────────────────────────────────────────────

export type Material = { emoji: string; name: string; quantity?: string; checked?: boolean };

export type MaterialItemProps = Material & { onToggle?: () => void };

/** Tap-to-tick row: tick box, picture, name (19px), quantity underneath. */
export function MaterialItem({ emoji, name, quantity, checked, onToggle }: MaterialItemProps) {
  const [on, toggle] = useToggle(checked, onToggle);
  const focus = useFocus();
  return (
    <Pressable
      onPress={toggle}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      hitSlop={hitSlopFor(60)}
      accessibilityRole="checkbox"
      accessibilityLabel={quantity ? `${name}. ${quantity}` : name}
      accessibilityState={{ checked: on }}
      style={({ pressed }) => [styles.item, on && styles.itemOn, pressed && styles.pressed, focus.focused && focusRing]}
    >
      <TickBox on={on} />
      <Text variant="reading" style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no">{emoji}</Text>
      <View style={styles.itemText}>
        <Text variant="reading" style={{ fontFamily: fontFamily[700] }}>{name}</Text>
        {quantity ? <Text variant="label" color={palette.navyMuted} style={f(500, 15, 20)}>{quantity}</Text> : null}
      </View>
    </Pressable>
  );
}

export type MaterialsListProps = {
  items: Material[];
  title?: string;
  /** Pass to control ticks yourself (uses each item's `checked`). Leave out and the list keeps its own ticks. */
  onToggle?: (index: number) => void;
};

export function MaterialsList({ items, title = "You'll need", onToggle }: MaterialsListProps) {
  const [ticked, setTicked] = useState<boolean[]>(() => items.map(it => !!it.checked));
  return (
    <View style={styles.list}>
      <Text variant="reading" accessibilityRole="header" style={{ fontFamily: fontFamily[800] }}>{title}</Text>
      {items.map((it, i) => (
        <MaterialItem
          key={`${it.name}-${i}`}
          {...it}
          checked={onToggle ? it.checked : !!ticked[i]}
          onToggle={onToggle ? () => onToggle(i) : () => setTicked(t => { const n = items.map((_, j) => !!t[j]); n[i] = !n[i]; return n; })}
        />
      ))}
    </View>
  );
}

// ── Experiment step ──────────────────────────────────────────────────────────

export type ExperimentStepProps = {
  num: number;
  instruction: string;
  tip?: string;
  done?: boolean;
  /** Pass to control `done` yourself; leave out and the step keeps its own state. */
  onToggle?: () => void;
};

/** One thing to do: Investigate-coloured number, the instruction, and an optional tip. */
export function ExperimentStep({ num, instruction, tip, done, onToggle }: ExperimentStepProps) {
  const [on, toggle] = useToggle(done, onToggle);
  const focus = useFocus();
  return (
    <Pressable
      onPress={toggle}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      hitSlop={hitSlopFor(64)}
      accessibilityRole="checkbox"
      accessibilityLabel={`Step ${num}. ${instruction}${tip ? ` Tip: ${tip}` : ''}`}
      accessibilityState={{ checked: on }}
      style={({ pressed }) => [styles.step, on && styles.itemOn, pressed && styles.pressed, focus.focused && focusRing]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.num, on ? styles.numOn : { backgroundColor: inv.pale, borderColor: inv.bg }]}
      >
        {on ? <IconCheck size={18} color={palette.white} /> : <Text variant="body" color={inv.text} style={{ fontFamily: fontFamily[800] }}>{num}</Text>}
      </View>
      <View style={styles.stepText}>
        <Text variant="reading" style={[f(700, 19, 26)]}>{instruction}</Text>
        {tip ? (
          <View style={styles.tip}>
            <View style={styles.tipIcon}><IconLightbulb size={16} color={palette.navy} /></View>
            <Text variant="label" style={[styles.tipText, f(500, 15, 20)]}>{tip}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Investigation card ───────────────────────────────────────────────────────

export type InvestigationCardProps = {
  question: string;
  /** e.g. "About 20 minutes a day" */
  minutes: string;
  safety: { icon: 'touch' | 'adult'; label: string }[];
  materials: Material[];
  steps: { instruction: string; tip?: string }[];
  onDone?: () => void;
};

export function InvestigationCard({ question, minutes, safety, materials, steps, onDone }: InvestigationCardProps) {
  return (
    <View style={styles.card}>
      <StepChip stepId="investigate" />
      <Text variant="heading" style={f(800, 24, 29)}>{question}</Text>
      <View style={styles.tags}>
        <Tag kind="time" icon="time">{minutes}</Tag>
        {safety.map(s => <Tag key={s.label} kind="safety" icon={s.icon}>{s.label}</Tag>)}
      </View>
      <MaterialsList items={materials} />
      <View style={styles.list}>
        <Text variant="reading" accessibilityRole="header" style={{ fontFamily: fontFamily[800] }}>What to do</Text>
        {steps.map((s, i) => (
          <ExperimentStep key={`${i}-${s.instruction}`} num={i + 1} instruction={s.instruction} tip={s.tip} />
        ))}
      </View>
      <Button label="I did it! Tell Nudge" size="lg" fullWidth onPress={onDone}
        icon={({ color, size }) => <IconCheck size={size} color={color} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  tick: { width: 32, height: 32, borderRadius: radius.sm, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  tickOn: { backgroundColor: palette.navy, borderColor: palette.navy },
  tickOff: { backgroundColor: palette.white, borderColor: palette.edge },

  list: { gap: space[2] },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1.5, borderColor: hairline, paddingHorizontal: space[4], paddingVertical: space[3] },
  itemOn: { backgroundColor: palette.cream },
  pressed: { opacity: 0.85 },
  emoji: { fontSize: 24, lineHeight: 30 },
  itemText: { flex: 1, minWidth: 0 },

  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: palette.white, borderRadius: 18, borderWidth: 1.5, borderColor: hairline, paddingHorizontal: space[4], paddingVertical: 14 },
  num: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  numOn: { backgroundColor: palette.navy, borderColor: palette.navy },
  stepText: { flex: 1, minWidth: 0, paddingTop: 4, alignItems: 'flex-start' },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6, backgroundColor: nudgeBubble, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  tipIcon: { marginTop: 2 },
  tipText: { flexShrink: 1 },

  card: { backgroundColor: palette.paper, borderRadius: radius.xxl, borderWidth: 1.5, borderColor: hairline, padding: space[5], gap: space[4] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});

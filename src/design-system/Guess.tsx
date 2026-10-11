/**
 * Making a guess (step 3).
 *   WordTile           tap a word to put it in a blank. Picked = coral.
 *   BlankSlot          a gap in the sentence. Empty = dashed, filled = coral.
 *   HypothesisBuilder  "I think ___ change because they need to ___."
 *   AnswerCards        pick one of a few ready-made guesses.
 * There is no right or wrong here: praise names what the child did ("Brave guess!").
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { PraisePill } from './Chips';
import { IconCheck, IconLightbulb } from './icons';
import { Text } from './Text';
import { fontFamily, focusRing, hairline, hitSlopFor, palette, radius, shadow, space, step as getStep } from './tokens';

const guess = getStep('hypothesize');
const tileH = 56;

// ── WordTile ──────────────────────────────────────────────────────────────────

export type WordTileProps = { word: string; picked?: boolean; onPress?: () => void };

export function WordTile({ word, picked = false, onPress }: WordTileProps) {
  const [focused, setFocused] = useState(false);
  const press = picked ? guess.press : palette.sandPress;
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(tileH)}
      accessibilityRole="button"
      accessibilityLabel={word}
      accessibilityHint={picked ? 'Tap to take it out' : 'Tap to put it in the blank'}
      accessibilityState={{ selected: picked }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: picked ? guess.bg : palette.white,
          borderColor: picked ? guess.press : palette.edge,
          boxShadow: pressed ? undefined : shadow.press(press, 4),
          transform: [{ translateY: pressed ? 4 : 0 }],
        },
        focused && focusRing,
      ]}
    >
      <Text variant="chip">{word}</Text>
    </Pressable>
  );
}

// ── BlankSlot ─────────────────────────────────────────────────────────────────

export type BlankSlotProps = { value?: string; onPress?: () => void };

export function BlankSlot({ value, onPress }: BlankSlotProps) {
  const [focused, setFocused] = useState(false);
  const empty = !value;
  const look = [styles.slot, empty ? styles.slotEmpty : styles.slotFilled];
  const label = empty
    ? (
      <Text variant="reading" color={guess.text} style={styles.bold700}>tap a word</Text>
    ) : (
      <Text variant="reading" style={styles.bold800}>{value}</Text>
    );

  if (!onPress) {
    return (
      <View style={look} accessible accessibilityLabel={empty ? 'Empty blank. Pick a word below.' : `Blank: ${value}`}>
        {label}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(tileH)}
      accessibilityRole="button"
      accessibilityLabel={empty ? 'Empty blank. Pick a word below.' : `Blank: ${value}`}
      accessibilityHint={empty ? undefined : 'Tap to take the word out'}
      style={({ pressed }) => [look, pressed && { opacity: 0.8 }, focused && focusRing]}
    >
      {label}
    </Pressable>
  );
}

// ── HypothesisBuilder ─────────────────────────────────────────────────────────

export type WordBank = { label: string; words: string[] };

export type HypothesisBuilderProps = {
  /** Sentence after "I think". Strings are words; numbers are the index of a blank (and of its bank). */
  parts: (string | number)[];
  /** One bank per blank, in blank order. */
  banks: WordBank[];
  /** Called with the full sentence when the child taps "Let's find out!". */
  onDone?: (sentence: string) => void;
};

export function HypothesisBuilder({ parts, banks, onDone }: HypothesisBuilderProps) {
  const blankCount = banks.length;
  const [picks, setPicks] = useState<(string | null)[]>(() => Array.from({ length: blankCount }, () => null));
  const [submitted, setSubmitted] = useState(false);
  const ready = picks.length === blankCount && picks.every(Boolean);

  const setPick = (i: number, w: string | null) => setPicks(prev => prev.map((p, j) => (j === i ? w : p)));

  const sentence = ['I think', ...parts.map(p => (typeof p === 'number' ? picks[p] ?? '___' : p))]
    .join(' ')
    .replace(/\s+([.,!?])/g, '$1');

  return (
    <View style={styles.card}>
      {submitted ? (
        <PraisePill stepId="hypothesize" />
      ) : (
        <View style={styles.guessPill}>
          <View style={[styles.guessCircle, { backgroundColor: guess.bg }]}>
            <IconLightbulb size={18} color={guess.fg} />
          </View>
          <Text variant="body" style={styles.bold800}>{guess.label}</Text>
        </View>
      )}

      {!submitted && <Text variant="title">Finish your guess</Text>}

      <View style={styles.sentence} accessible={submitted} accessibilityLabel={submitted ? sentence : undefined}>
        <Text variant="title" color={guess.text}>I think</Text>
        {parts.map((p, k) => {
          if (typeof p === 'number') {
            const v = picks[p] ?? undefined;
            return (
              <BlankSlot key={`b${k}`} value={v} onPress={!submitted && v ? () => setPick(p, null) : undefined} />
            );
          }
          // Split into words so the sentence wraps naturally on small phones.
          return p.split(/\s+/).filter(Boolean).map((w, j) => (
            <Text key={`t${k}-${j}`} variant="title" style={styles.bold700} accessibilityRole="text">{w}</Text>
          ));
        })}
      </View>

      {!submitted ? (
        <>
          {banks.map((bank, i) => (
            <View key={bank.label} style={styles.bank}>
              <Text variant="body" color={guess.text} style={styles.bold800}>{bank.label}</Text>
              <View style={styles.tiles} accessibilityLabel={bank.label}>
                {bank.words.map(w => (
                  <WordTile key={w} word={w} picked={picks[i] === w} onPress={() => setPick(i, picks[i] === w ? null : w)} />
                ))}
              </View>
            </View>
          ))}
          <Button
            label="That's my guess!"
            icon={({ color, size }) => <IconCheck color={color} size={size} />}
            disabled={!ready}
            reason="Pick a word for each blank first."
            onPress={() => ready && setSubmitted(true)}
          />
        </>
      ) : (
        <View style={styles.after}>
          <Button
            label="Let's find out!"
            size="lg"
            fullWidth
            icon={({ color, size }) => <IconCheck color={color} size={size} />}
            onPress={() => onDone?.(sentence)}
          />
          <Button label="Change my guess" variant="quiet" fullWidth onPress={() => setSubmitted(false)} />
        </View>
      )}
    </View>
  );
}

// ── AnswerCards ───────────────────────────────────────────────────────────────

export type Answer = { emoji?: string; label: string; sublabel?: string };

export type AnswerCardsProps = {
  question: string;
  answers: Answer[];
  onPick?: (answer: Answer) => void;
};

function AnswerCard({ answer, selected, onPress }: { answer: Answer; selected: boolean; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  const { emoji, label, sublabel } = answer;
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="radio"
      accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
      accessibilityState={{ checked: selected, selected }}
      style={({ pressed }) => [
        styles.answer,
        selected && styles.answerSelected,
        pressed && !selected && { opacity: 0.85 },
        focused && focusRing,
      ]}
    >
      {emoji ? <Text style={styles.emoji} importantForAccessibility="no" accessibilityElementsHidden>{emoji}</Text> : null}
      <View style={styles.answerText}>
        <Text variant="reading" color={selected ? '#2B5C5C' : palette.navy} style={styles.bold800}>{label}</Text>
        {sublabel ? <Text variant="caption">{sublabel}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <IconCheck size={14} color={palette.navy} strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

export function AnswerCards({ question, answers, onPick }: AnswerCardsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <View style={styles.answers}>
      <Text variant="reading" style={styles.bold800}>{question}</Text>
      <View style={styles.answerList} accessibilityRole="radiogroup" accessibilityLabel={question}>
        {answers.map(a => (
          <AnswerCard
            key={a.label}
            answer={a}
            selected={selected === a.label}
            onPress={() => { setSelected(a.label); onPick?.(a); }}
          />
        ))}
      </View>
      {selected && (
        <View accessibilityLiveRegion="polite">
          <PraisePill stepId="hypothesize" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bold700: { fontFamily: fontFamily[700] },
  bold800: { fontFamily: fontFamily[800] },

  tile: {
    height: tileH,
    minWidth: 72,
    paddingHorizontal: space[5],
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  slot: { height: tileH, borderRadius: radius.md, paddingHorizontal: space[4], alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  slotEmpty: { minWidth: 110, backgroundColor: palette.paper, borderColor: guess.press, borderStyle: 'dashed' },
  slotFilled: { minWidth: 72, backgroundColor: guess.bg, borderColor: guess.bg },

  card: { backgroundColor: guess.pale, borderRadius: radius.xxl, padding: space[5], gap: space[4] },
  guessPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: space[2],
    backgroundColor: palette.paper, borderRadius: radius.pill, paddingLeft: 6, paddingRight: 14, paddingVertical: 6,
  },
  guessCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
  bank: { gap: space[2] },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  after: { gap: space[1], alignSelf: 'stretch' },

  answers: { gap: 14, alignSelf: 'stretch' },
  answerList: { gap: 10 },
  answer: {
    flexDirection: 'row', alignItems: 'center', gap: space[4],
    minHeight: 76,
    backgroundColor: palette.white,
    borderWidth: 3, borderColor: hairline, borderRadius: radius.lg,
    paddingVertical: space[4], paddingHorizontal: 18,
  },
  answerSelected: {
    backgroundColor: '#E2EFEF', borderColor: '#6FA3A3',
    boxShadow: '0px 0px 0px 4px rgba(176, 212, 212, 0.25)',
    transform: [{ scale: 1.02 }],
  },
  emoji: { fontSize: 30, lineHeight: 36 },
  answerText: { flex: 1, gap: 2 },
  radio: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: palette.edge,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { backgroundColor: '#6FA3A3', borderColor: '#6FA3A3' },
});

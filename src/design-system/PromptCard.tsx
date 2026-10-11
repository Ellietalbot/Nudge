/**
 * PromptCard: Nudge asks one question for a step, the child answers in their own words.
 * The step's sentence starter ("I noticed") sits bold in the field; the placeholder is an example.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { StepChip } from './Chips';
import { IconCamera, IconCheck, IconSprout } from './icons';
import { Text } from './Text';
import { TextField } from './TextField';
import { hairline, palette, radius, space, step as getStep, type StepId } from './tokens';

export type PromptCardProps = {
  stepId: StepId;
  question: string;
  /** Example answer that finishes the starter, e.g. "they grow in a ring" (no "Like:", because the starter comes first). */
  example: string;
  /** Show "Add a photo" (Observe). */
  photo?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onSave?: () => void;
  onAddPhoto?: () => void;
};

/** How the child answers at each step. */
export const answerMethod: Record<StepId, string> = {
  observe: 'Photo first, then a few words',
  ask: 'Type it',
  hypothesize: 'Word tiles (the hypothesis builder)',
  investigate: 'After the "what to do" checklist',
  reflect: 'Type it, then it saves to the journal',
};

export function PromptCard({ stepId, question, example, photo, value, onChangeText, onSave, onAddPhoto }: PromptCardProps) {
  const s = getStep(stepId);
  const placeholder = example;
  return (
    <View style={styles.card}>
      <StepChip stepId={stepId} />
      <View style={styles.questionRow}>
        <View style={styles.sprout} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <IconSprout size={18} color={palette.navy} />
        </View>
        <Text variant="title" style={styles.question}>{question}</Text>
      </View>
      <TextField
        label={question}
        hideLabel
        starter={s.prompt}
        starterColor={s.text}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.actions}>
        {photo && (
          <Button
            label="Add a photo"
            variant="secondary"
            icon={({ color, size }) => <IconCamera color={color} size={size} />}
            onPress={onAddPhoto}
          />
        )}
        <Button
          label="Save"
          icon={({ color, size }) => <IconCheck color={color} size={size} />}
          onPress={onSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    backgroundColor: palette.paper,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: hairline,
    padding: 18,
  },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sprout: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center', marginTop: -2 },
  question: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10, marginTop: space[1] },
});

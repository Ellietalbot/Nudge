/**
 * TextField: one flat field for the child's own words.
 *   - White, 2px edge border; focused = navy border and a soft glow.
 *   - Grows with the words (multiline, no fixed height).
 *   - `starter` is the step's sentence starter ("I noticed") shown bold before the words.
 *   - `hint` is Nudge asking for a bit more (lavender, sprout tile).
 *   - `problem` is an app problem, never the child's fault. Announced politely.
 * Placeholders are examples and start with "Like:" (for example "Like: they grow in a ring").
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { IconAlertTriangle, IconSprout } from './icons';
import { Text } from './Text';
import { fontFamily, nudgeBubble, palette, space, type } from './tokens';

export type TextFieldProps = {
  /** Always required: shown above the field, or read by screen readers when `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  /** An example answer. Start it with "Like:". */
  placeholder?: string;
  /** Sentence starter shown bold before the child's words, e.g. "I noticed". */
  starter?: string;
  starterColor?: string;
  /** Nudge asking for a little more. */
  hint?: string;
  /** Something went wrong in the app (not the child). */
  problem?: string;
};

const placeholderColor = 'rgba(0, 54, 98, 0.65)';
const glow = '0px 0px 0px 4px rgba(0, 54, 98, 0.12)';

export function TextField({
  label, hideLabel, value, defaultValue, onChangeText, placeholder, starter, starterColor = palette.navy, hint, problem,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const a11yLabel = starter ? `${label}. Starts with: ${starter}` : label;

  return (
    <View style={styles.wrap}>
      {!hideLabel && (
        <Text variant="reading" style={styles.label} importantForAccessibility="no" accessibilityElementsHidden>
          {label}
        </Text>
      )}
      <View style={[styles.field, focused && styles.fieldFocused]}>
        {starter ? (
          <Text
            variant="reading"
            color={starterColor}
            style={styles.starter}
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {starter}
          </Text>
        ) : null}
        <TextInput
          multiline
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={a11yLabel}
          accessibilityHint={problem ?? hint}
          maxFontSizeMultiplier={2}
          scrollEnabled={false}
          textAlignVertical="top"
          selectionColor={palette.navy}
          cursorColor={palette.navy}
          style={styles.input}
        />
      </View>
      {hint ? (
        <View style={styles.hint}>
          <View style={styles.sprout}>
            <IconSprout size={18} color={palette.navy} />
          </View>
          <Text variant="body" style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
      {problem ? (
        <View style={styles.problem} accessibilityLiveRegion="polite" accessible accessibilityLabel={problem}>
          <IconAlertTriangle size={20} color={palette.navy} />
          <Text variant="body" style={styles.problemText}>{problem}</Text>
        </View>
      ) : null}
    </View>
  );
}

const lineHeight = type.reading.lineHeight;

const styles = StyleSheet.create({
  wrap: { gap: 10, alignSelf: 'stretch' },
  label: { fontFamily: fontFamily[800] },
  field: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    columnGap: 6,
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: palette.edge,
    borderRadius: 18,
  },
  fieldFocused: { borderColor: palette.navy, boxShadow: glow },
  starter: { fontFamily: fontFamily[800], lineHeight },
  input: {
    flex: 1,
    minWidth: 120,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    fontFamily: fontFamily[500],
    fontSize: type.reading.fontSize,
    lineHeight,
    color: palette.navy,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: nudgeBubble,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sprout: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center' },
  hintText: { flex: 1, paddingTop: 2, fontFamily: fontFamily[700] },
  problem: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  problemText: { flex: 1, fontFamily: fontFamily[700] },
});

/**
 * Quick replies: suggested answers the child can tap instead of talking or typing.
 * Right-aligned (they are the child's words), white pills with a press shadow.
 * The forward reply (moves to the next step) gets a navy edge, bolder words and the
 * next step's colour in its icon circle. After a tap, the screen should turn the pick
 * into a ChildBubble and hide the rest.
 *
 * Rules for the AI (put these in the system prompt):
 *   - At most 3 replies. (Enforced here: extras are dropped with a dev warning.)
 *   - Written the way the child would say it ("I have a guess!", not "Make a hypothesis").
 *   - Exactly one reply moves forward to the next step (`forward: StepId`).
 *   - "I'm not sure" is always one of them.
 *   - No emoji.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { IconProps } from './icons';
import { stepIcon } from './stepIcons';
import { Text } from './Text';
import { focusRing, fontFamily, hitSlopFor, palette, shadow, space, step as getStep, type StepId } from './tokens';

const MAX_REPLIES = 3;
const MIN_HEIGHT = 56;
const PRESS = '#D3CCBF';

export type QuickReply = {
  label: string;
  /** This reply moves the chat to this step. Use for exactly one reply. */
  forward?: StepId;
  /** Optional icon for a non-forward reply (forward replies use the step's icon). */
  icon?: (p: IconProps) => React.ReactElement;
};

export type QuickRepliesProps = {
  replies: QuickReply[];
  onPick: (label: string) => void;
};

export function QuickReplies({ replies, onPick }: QuickRepliesProps) {
  if (replies.length > MAX_REPLIES && __DEV__) {
    console.warn(`QuickReplies: got ${replies.length} replies, showing the first ${MAX_REPLIES}. The AI should send at most ${MAX_REPLIES}.`);
  }
  return (
    <View style={styles.stack} accessibilityLabel="Quick replies">
      {replies.slice(0, MAX_REPLIES).map(r => (
        <ReplyPill key={r.label} reply={r} onPick={onPick} />
      ))}
    </View>
  );
}

function ReplyPill({ reply, onPick }: { reply: QuickReply; onPick: (label: string) => void }) {
  const [focused, setFocused] = useState(false);
  const s = reply.forward ? getStep(reply.forward) : undefined;
  const Icon = reply.forward ? stepIcon[reply.forward] : reply.icon;
  return (
    <Pressable
      onPress={() => onPick(reply.label)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(MIN_HEIGHT)}
      accessibilityRole="button"
      accessibilityLabel={reply.label}
      accessibilityHint={s ? `Goes to step ${s.num}, ${s.label}` : undefined}
      style={({ pressed }) => [
        styles.pill,
        Icon ? styles.withIcon : styles.noIcon,
        { borderColor: s ? palette.navy : palette.edge },
        { boxShadow: pressed ? undefined : shadow.press(PRESS, 4), transform: [{ translateY: pressed ? 4 : 0 }] },
        focused && focusRing,
      ]}
    >
      {Icon ? (
        <View style={[styles.iconCircle, { backgroundColor: s?.bg ?? '#E2EFEF' }]}>
          <Icon size={18} color={s?.fg ?? '#2B5C5C'} />
        </View>
      ) : null}
      <Text variant="chip" style={[styles.label, s && styles.forwardLabel]}>{reply.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'flex-end', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: MIN_HEIGHT,
    maxWidth: '90%',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: palette.white,
    paddingVertical: space[2],
  },
  withIcon: { paddingLeft: space[2], paddingRight: 18 },
  noIcon: { paddingHorizontal: 18 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { flexShrink: 1 },
  forwardLabel: { fontFamily: fontFamily[800] },
});

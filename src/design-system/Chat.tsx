/**
 * Chat pieces for talking with Nudge.
 *   NudgeAvatar      Nudge's flat face (teal square, navy sprout). Decorative.
 *   NudgeBubble      lavender, tail top-left, face beside the first message in a run
 *   ChildBubble      navy with white words, tail top-right, on the right
 *   PhotoBubble      the child's photo, navy, on the right
 *   TypingIndicator  three lavender dots that gently bounce (still when Reduce Motion is on)
 *   StepDivider      flat chapter divider when the chat moves to a new step. Not tappable.
 *
 * Nudge's bubble is always lavender. Celebrate with words (a PraisePill inside), never
 * with a different bubble colour. Nothing here is tappable except the Read to me button,
 * so nothing here has a press shadow.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { IconCamera, IconSprout } from './icons';
import { ReadAloudButton } from './ReadAloudButton';
import { stepIcon } from './stepIcons';
import { Text } from './Text';
import { useReduceMotion } from './useReduceMotion';
import { childBubble, fontFamily, nudgeBubble, palette, space, step as getStep, type StepId } from './tokens';

const BUBBLE_RADIUS = 22;
const TAIL_RADIUS = 6;
const AVATAR = 40;
const DOT = '#7D75D6';
const DIVIDER_LINE = '#D3CCBF';

/** Flattens string/number children (including nested elements) into plain text for screen readers. */
export function plainText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode; label?: string };
    return props.children != null ? plainText(props.children) : props.label ?? '';
  }
  return '';
}

/** Nudge's flat face. No shadow: it is not tappable. Hidden from screen readers. */
export function NudgeAvatar() {
  return (
    <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <IconSprout size={20} color={palette.navy} />
    </View>
  );
}

/** Keeps follow-up bubbles lined up with the first one when the face is not shown. */
function AvatarSpacer() {
  return <View style={styles.avatarSpacer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}

export type NudgeBubbleProps = {
  children: React.ReactNode;
  /** Plain words for Read to me. Shows the button when given. */
  speak?: string;
  /** First message in a run shows Nudge's face; the rest get a spacer. */
  first?: boolean;
};

export function NudgeBubble({ children, speak, first = true }: NudgeBubbleProps) {
  const words = speak ?? plainText(children);
  return (
    <View style={styles.nudgeRow}>
      {first ? <NudgeAvatar /> : <AvatarSpacer />}
      <View style={styles.nudgeCol}>
        <View
          style={styles.nudgeBubble}
          accessible
          accessibilityLabel={`Nudge says: ${words}`}
        >
          {typeof children === 'string' || typeof children === 'number' ? <Text variant="reading">{children}</Text> : children}
        </View>
        {speak ? <ReadAloudButton text={speak} /> : null}
      </View>
    </View>
  );
}

export function ChildBubble({ children }: { children: React.ReactNode }) {
  const words = plainText(children);
  return (
    <View style={styles.childRow}>
      <View style={styles.childBubble} accessible accessibilityLabel={`You said: ${words}`}>
        {typeof children === 'string' || typeof children === 'number'
          ? <Text variant="reading" color={palette.white}>{children}</Text>
          : children}
      </View>
    </View>
  );
}

export type PhotoBubbleProps = {
  /** The photo (e.g. an <Image>). Shows a quiet placeholder when left out. */
  image?: React.ReactNode;
  caption?: string;
};

export function PhotoBubble({ image, caption }: PhotoBubbleProps) {
  return (
    <View style={styles.childRow}>
      <View
        style={[styles.childBubble, styles.photoBubble]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={caption ? `Your photo: ${caption}` : 'Your photo'}
      >
        {image ?? (
          <View style={styles.photoPlaceholder}>
            <IconCamera size={32} color="rgba(255, 255, 255, 0.35)" />
          </View>
        )}
        {caption ? <Text variant="reading" color={palette.white} style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

/** Three dots that gently bounce while Nudge thinks. Still when Reduce Motion is on. */
export function TypingIndicator() {
  const reduceMotion = useReduceMotion();
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reduceMotion) {
      dots.forEach(d => d.setValue(0));
      return;
    }
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(d, { toValue: 1, duration: 360, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 360, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.delay(480 - i * 200),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [reduceMotion, dots]);

  return (
    <View
      style={styles.nudgeRow}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Nudge is thinking"
      accessibilityLiveRegion="polite"
    >
      <NudgeAvatar />
      <View style={[styles.nudgeBubble, styles.typing]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}
          />
        ))}
      </View>
    </View>
  );
}

/** Chapter divider: a line either side, the step colour in a circle, navy words on cream. */
export function StepDivider({ stepId }: { stepId: StepId }) {
  const s = getStep(stepId);
  const Icon = stepIcon[stepId];
  return (
    <View
      style={styles.divider}
      accessible
      accessibilityRole="none"
      accessibilityLabel={`Step ${s.num}: ${s.label}`}
    >
      <View style={styles.line} />
      <View style={styles.dividerPill}>
        <View style={[styles.dividerCircle, { backgroundColor: s.bg }]}>
          <Icon size={18} color={s.fg} />
        </View>
        <Text variant="body" style={styles.dividerText} numberOfLines={1}>{`Step ${s.num} · ${s.label}`}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: AVATAR, height: AVATAR, borderRadius: 14, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarSpacer: { width: AVATAR, flexShrink: 0 },

  nudgeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  nudgeCol: { maxWidth: '82%', alignItems: 'flex-start', gap: space[2], flexShrink: 1 },
  nudgeBubble: {
    backgroundColor: nudgeBubble,
    borderRadius: BUBBLE_RADIUS,
    borderTopLeftRadius: TAIL_RADIUS,
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },

  childRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  childBubble: {
    maxWidth: '78%',
    backgroundColor: childBubble,
    borderRadius: BUBBLE_RADIUS,
    borderTopRightRadius: TAIL_RADIUS,
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  photoBubble: { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden', width: '78%' },
  photoPlaceholder: { height: 176, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B2747' },
  caption: { paddingHorizontal: space[4], paddingVertical: space[3] },

  typing: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 18 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DOT },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: space[1] },
  line: { flex: 1, height: 2, borderRadius: 1, backgroundColor: DIVIDER_LINE },
  dividerPill: { flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: palette.cream, borderRadius: 999, paddingLeft: 4, paddingRight: 14, paddingVertical: 4 },
  dividerCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dividerText: { fontFamily: fontFamily[800] },
});

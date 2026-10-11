/**
 * Where am I in the 5 steps?
 *   StepPath           the calm overview: all 5 steps and their sentence starters.
 *   AdventureProgress  one adventure: done = tick, now = ringed, to come = dashed.
 *   StepProgress       the compact version for the top bar.
 * Each progress read-out is one screen-reader stop: "Step 3 of 5, Guess!".
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconCheck, IconLoopBack } from './icons';
import { stepIcon } from './stepIcons';
import { Text } from './Text';
import { fontFamily, hairline, palette, radius, space, steps } from './tokens';

const progressLabel = (current: number) => `Step ${current + 1} of 5, ${steps[current].label}`;
const clamp = (n: number) => Math.max(0, Math.min(steps.length - 1, Math.round(n)));

// ── StepPath ──────────────────────────────────────────────────────────────────

export function StepPath({ title = '5 steps to find out' }: { title?: string }) {
  return (
    <View style={styles.card}>
      <Text variant="heading" style={styles.pathTitle}>{title}</Text>
      <View>
        <View style={styles.pathLine} importantForAccessibility="no" accessibilityElementsHidden />
        {steps.map((s, i) => {
          const Icon = stepIcon[s.id];
          return (
            <View
              key={s.id}
              style={[styles.pathRow, i < steps.length - 1 && { marginBottom: 22 }]}
              accessible
              accessibilityLabel={`${s.num}. ${s.label}: “${s.prompt}…”`}
            >
              <View style={[styles.pathCircle, { backgroundColor: s.bg }]}>
                <Icon size={26} color={s.fg} />
              </View>
              <View style={styles.flex}>
                <Text variant="title">{s.label}</Text>
                <Text variant="reading" color={palette.navyMuted}>“{s.prompt}…”</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.loopRow}>
        <IconLoopBack size={22} color={palette.navyMuted} />
        <Text variant="body" color={palette.navyMuted} style={[styles.flex, styles.bold700]}>
          Then start again with a new question.
        </Text>
      </View>
    </View>
  );
}

// ── AdventureProgress ─────────────────────────────────────────────────────────

export function AdventureProgress({ title, current }: { title: string; current: number }) {
  const cur = clamp(current);
  const now = steps[cur];
  // Five names only fit side by side from ~420pt wide. On a phone we hide them;
  // "You're on: …" above still names the current step, and screen readers hear it all.
  const [trackWidth, setTrackWidth] = useState(0);
  const showLabels = trackWidth >= 420;
  return (
    <View style={[styles.card, styles.adventureCard]}>
      <Text variant="title">{title}</Text>
      <Text variant="body" color={palette.navyMuted} style={styles.youreOn}>
        You're on: <Text variant="body" color={now.text} style={styles.bold800}>{now.label}</Text>
      </Text>
      <View style={styles.track} accessible accessibilityLabel={progressLabel(cur)} onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}>
        {steps.map((s, i) => {
          const Icon = stepIcon[s.id];
          const done = i < cur;
          const isNow = i === cur;
          return (
            <View key={s.id} style={styles.stop} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <View style={styles.circleRow}>
                {i > 0 && <View style={[styles.seg, styles.segLeft, { backgroundColor: i <= cur ? palette.edge : palette.sand }]} />}
                {i < steps.length - 1 && <View style={[styles.seg, styles.segRight, { backgroundColor: i < cur ? palette.edge : palette.sand }]} />}
                {done ? (
                  <View style={[styles.dot, { backgroundColor: s.bg }]}>
                    <IconCheck size={20} color={s.fg} />
                  </View>
                ) : isNow ? (
                  <View style={[styles.nowDot, { backgroundColor: s.bg, boxShadow: `0px 0px 0px 4px ${palette.paper}, 0px 0px 0px 7px ${s.bg}` }]}>
                    <Icon size={22} color={s.fg} />
                  </View>
                ) : (
                  <View style={[styles.dot, styles.future]}>
                    <Icon size={20} color={palette.navyMuted} />
                  </View>
                )}
              </View>
              {showLabels && <Text
                variant="label"
                align="center"
                color={isNow ? palette.navy : palette.navyMuted}
                style={isNow && styles.bold800}
              >
                {s.label}
              </Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── StepProgress (top bar) ────────────────────────────────────────────────────

export function StepProgress({ current }: { current: number }) {
  const cur = clamp(current);
  const now = steps[cur];
  return (
    <View style={styles.compact} accessible accessibilityLabel={progressLabel(cur)}>
      <View style={styles.compactRow} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {steps.map((s, i) => {
          const Icon = stepIcon[s.id];
          return (
            <React.Fragment key={s.id}>
              {i < cur ? (
                <View style={[styles.miniDot, { backgroundColor: s.bg }]}>
                  <IconCheck size={12} color={s.fg} />
                </View>
              ) : i === cur ? (
                <View style={[styles.miniNow, { backgroundColor: s.bg, boxShadow: `0px 0px 0px 3px ${palette.cream}, 0px 0px 0px 5px ${s.bg}` }]}>
                  <Icon size={16} color={s.fg} />
                </View>
              ) : (
                <View style={[styles.miniDot, styles.miniFuture]} />
              )}
              {i < steps.length - 1 && (
                <View style={[styles.miniSeg, { backgroundColor: i < cur ? palette.edge : palette.sand }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <Text variant="label" color={palette.navyMuted} style={styles.medium} importantForAccessibility="no">
        Step {cur + 1} of 5 · <Text variant="label" color={now.text} style={styles.bold800}>{now.label}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: fontFamily[500] },
  bold700: { fontFamily: fontFamily[700] },
  bold800: { fontFamily: fontFamily[800] },

  card: {
    backgroundColor: palette.paper,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: hairline,
    paddingHorizontal: space[6],
    paddingVertical: 28,
  },

  // StepPath
  pathTitle: { marginBottom: space[5] },
  pathLine: { position: 'absolute', left: 26.5, top: 28, bottom: 28, width: 3, borderRadius: 2, backgroundColor: palette.sand },
  pathRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  pathCircle: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    boxShadow: `0px 0px 0px 5px ${palette.paper}`,
  },
  loopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space[5], paddingLeft: space[4] },

  // AdventureProgress
  adventureCard: { paddingHorizontal: 18, paddingVertical: space[5] },
  youreOn: { marginTop: 2, marginBottom: space[4] },
  track: { flexDirection: 'row', alignItems: 'flex-start' },
  stop: { flex: 1, alignItems: 'center', gap: 6, overflow: 'visible' },
  circleRow: { height: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  seg: { position: 'absolute', top: 20.5, height: 3 },
  segLeft: { left: 0, right: '50%' },
  segRight: { left: '50%', right: 0 },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nowDot: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  future: { backgroundColor: palette.paper, borderWidth: 2.5, borderStyle: 'dashed', borderColor: palette.edge },

  // StepProgress
  compact: { alignItems: 'flex-end', gap: 6 },
  compactRow: { flexDirection: 'row', alignItems: 'center', height: 40, paddingHorizontal: 5 },
  miniDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniNow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  miniFuture: { borderWidth: 2, borderStyle: 'dashed', borderColor: palette.edge },
  miniSeg: { width: 12, height: 3, borderRadius: 2 },
});

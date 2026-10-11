/**
 * The field journal: cover, entry rows, entry previews, discovery count, explorer
 * stickers and the finding card at the end of an adventure.
 *
 * Celebrate what the child explored, not how much or how often: no streaks, no points,
 * no locked badges, never right or wrong.
 * Photos come in as ReactNode (e.g. an expo-image <Image style={{width:'100%',height:'100%'}} />).
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Button } from './Button';
import { FoundItOut, StepChip } from './Chips';
import {
  IconBookOpen, IconBug, IconCalendar, IconCamera, IconCheck, IconChevronRight, IconCompass,
  IconFlask, IconLightbulb, IconMapPin, IconPlus, IconSprout, IconStar, IconSun, type IconProps,
} from './icons';
import { GraphPaper, SunStar, Tape } from './Paper';
import { ReadAloudButton } from './ReadAloudButton';
import { stepIcon } from './stepIcons';
import { Text } from './Text';
import {
  focusRing, fontFamily, hitSlopFor, nudgeBubble, palette, radius, shadow, space,
  step as getStep, steps, type StepId,
} from './tokens';

/** Font helper for the few one-off sizes in the journal (all 14px or bigger). */
function f(weight: keyof typeof fontFamily, fontSize: number, lineHeight: number): TextStyle {
  return { fontFamily: fontFamily[weight], fontSize, lineHeight };
}

const softEdge = 'rgba(0, 54, 98, 0.08)';

/** "<b>I tried</b> turning the jar upside down." with the starter in the step's text colour. */
function StarterLine({ stepId, line, style }: { stepId: StepId; line: string; style: TextStyle }) {
  const s = getStep(stepId);
  return (
    <Text variant="body" style={style}>
      <Text variant="body" color={s.text} style={[style, { fontFamily: fontFamily[800] }]}>{s.prompt}</Text> {line}
    </Text>
  );
}

function useFocus() {
  const [focused, setFocused] = useState(false);
  return { focused, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

// ── Cover ────────────────────────────────────────────────────────────────────

/** Graph paper and tape, flat. One number: what they've found out. */
export function JournalCover({ name, found, style }: { name: string; found: number; style?: StyleProp<ViewStyle> }) {
  return (
    <GraphPaper radius={radius.xl} style={[styles.cover, style]}>
      <Tape style={styles.coverTape} />
      <Text variant="label" color={palette.navyMuted}>My field journal</Text>
      <Text variant="heading" style={styles.coverHeading}>{name}'s discoveries</Text>
      <View style={styles.foundPill} accessible accessibilityLabel={`${found} found out so far`}>
        <SunStar size={18} />
        <Text variant="body">
          <Text variant="body" style={{ fontFamily: fontFamily[800] }}>{found}</Text> found out so far
        </Text>
      </View>
    </GraphPaper>
  );
}

// ── Section headings ─────────────────────────────────────────────────────────

/** Unfinished adventures first ("Still exploring"), then what they found out. */
export function JournalSectionHeading({ kind }: { kind: 'exploring' | 'found' }) {
  return (
    <View style={styles.sectionHeading} accessibilityRole="header">
      {kind === 'exploring'
        ? <Text variant="label" color={palette.navyMuted} style={{ fontFamily: fontFamily[800] }}>Still exploring</Text>
        : <FoundItOut />}
    </View>
  );
}

// ── Entry row ────────────────────────────────────────────────────────────────

export type JournalEntryRowProps = {
  question: string;
  /** The child's latest sentence, without the starter (e.g. "turning the jar upside down.") */
  line: string;
  date: string;
  /** Furthest step reached */
  stepId: StepId;
  photo?: React.ReactNode;
  onPress?: () => void;
};

/** Compact journal row: taped-in photo (or the step's icon), question, latest line. */
export function JournalEntryRow({ question, line, date, stepId, photo, onPress }: JournalEntryRowProps) {
  const s = getStep(stepId);
  const Icon = stepIcon[stepId];
  const focus = useFocus();
  return (
    <Pressable
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      hitSlop={hitSlopFor(88)}
      accessibilityRole="button"
      accessibilityLabel={`${question}. ${s.prompt} ${line}. ${date}`}
      accessibilityHint="Opens this journal page"
      style={({ pressed }) => [styles.row, pressed && styles.pressed, focus.focused && focusRing]}
    >
      <View style={[styles.thumb, { backgroundColor: photo ? palette.white : s.bg }]}>
        <View style={styles.thumbInner}>{photo ?? <Icon size={26} color={s.fg} />}</View>
      </View>
      <View style={styles.rowText}>
        <Text variant="title" style={f(800, 18, 22)}>{question}</Text>
        <StarterLine stepId={stepId} line={line} style={f(500, 16, 22)} />
        <Text variant="caption" color={palette.navyMuted}>{date}</Text>
      </View>
      <IconChevronRight size={22} color={palette.navyMuted} />
    </Pressable>
  );
}

// ── Entry preview ────────────────────────────────────────────────────────────

export type JournalEntryPreviewProps = {
  question: string;
  /** The child's latest sentence, without the starter */
  line: string;
  /** Furthest step reached */
  stepId: StepId;
  done?: boolean;
  date: string;
  location: string;
  photo?: React.ReactNode;
  onPress?: () => void;
};

/** Bigger journal card. Finished ones say "Found it out!"; unfinished ones say where they left off. */
export function JournalEntryPreview({ question, line, stepId, done, date, location, photo, onPress }: JournalEntryPreviewProps) {
  const s = getStep(stepId);
  const Icon = stepIcon[stepId];
  const focus = useFocus();
  const status = done ? 'Found it out!' : `Still exploring, ${s.label}`;
  return (
    <Pressable
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      hitSlop={hitSlopFor(144)}
      accessibilityRole="button"
      accessibilityLabel={`${status}. ${question}. ${s.prompt} ${line}. ${date}, ${location}`}
      accessibilityHint="Opens this journal page"
      style={({ pressed }) => [styles.previewPress, pressed && styles.pressed, focus.focused && focusRing]}
    >
      <GraphPaper radius={radius.xl} style={styles.preview}>
        {/* Taped-in photo */}
        <View style={[styles.previewPhoto, { backgroundColor: photo ? palette.white : s.bg, transform: [{ rotate: done ? '-3deg' : '2deg' }] }]}>
          <View style={styles.previewPhotoInner}>{photo ?? <Icon size={40} color={s.fg} />}</View>
          <View style={styles.previewTape} />
        </View>
        {/* Words on a solid panel so the grid never fights them */}
        <View style={styles.previewPanel}>
          {done ? <FoundItOut /> : <StepChip stepId={stepId} label={`Still exploring · ${s.label}`} />}
          <Text variant="title" style={f(800, 19, 23)}>{question}</Text>
          <StarterLine stepId={stepId} line={line} style={f(500, 17, 23)} />
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <IconCalendar size={16} color={palette.navyMuted} />
              <Text variant="label" color={palette.navyMuted} style={f(500, 15, 20)}>{date}</Text>
            </View>
            <View style={styles.metaItem}>
              <IconMapPin size={16} color={palette.navyMuted} />
              <Text variant="label" color={palette.navyMuted} style={f(500, 15, 20)}>{location}</Text>
            </View>
          </View>
        </View>
        <IconChevronRight size={24} color={palette.navyMuted} />
      </GraphPaper>
    </Pressable>
  );
}

// ── Discovery count ──────────────────────────────────────────────────────────

export function DiscoveryCount({ count }: { count: number }) {
  return (
    <GraphPaper radius={radius.xl} style={styles.count}>
      <View style={styles.countTile}>
        <IconBookOpen size={30} color={palette.navy} />
      </View>
      <View accessible accessibilityLabel={`${count} discoveries in your journal`}>
        <Text variant="display" style={f(900, 40, 44)} accessibilityRole="text">{count}</Text>
        <Text variant="body" color={palette.navyMuted} style={{ fontFamily: fontFamily[700] }}>discoveries in your journal</Text>
      </View>
    </GraphPaper>
  );
}

// ── Explorer stickers ────────────────────────────────────────────────────────

export type ExplorerSticker = {
  label: string;
  icon: (p: IconProps) => React.ReactElement;
  bg: string;
  fg: string;
  /** Degrees. */
  tilt: number;
};

/** Earned for kinds of exploring. Only earned stickers show. */
export const defaultStickers: ExplorerSticker[] = [
  { label: 'First photo', icon: IconCamera, bg: '#B0D4D4', fg: '#003662', tilt: -6 },
  { label: 'Brave guesser', icon: IconLightbulb, bg: '#E89979', fg: '#003662', tilt: 4 },
  { label: 'Tried it!', icon: IconFlask, bg: '#EB5921', fg: '#FFFFFF', tilt: -3 },
  { label: 'Bug buddy', icon: IconBug, bg: '#B5AFF5', fg: '#003662', tilt: 5 },
  { label: 'Sun watcher', icon: IconSun, bg: '#F2C14E', fg: '#003662', tilt: -4 },
  { label: 'Big discovery', icon: IconStar, bg: '#F2C14E', fg: '#003662', tilt: 6 },
];

/** Earned stickers plus a dashed spot that hints at more. */
export function ExplorerStickers({ stickers = defaultStickers }: { stickers?: ExplorerSticker[] }) {
  return (
    <View style={styles.stickers} accessibilityLabel="Explorer stickers">
      {stickers.map(st => (
        <View key={st.label} style={styles.sticker} accessible accessibilityLabel={`${st.label} sticker`}>
          <View style={[styles.stickerDisc, styles.stickerEarned, { backgroundColor: st.bg, transform: [{ rotate: `${st.tilt}deg` }] }]}>
            <st.icon size={34} color={st.fg} />
          </View>
          <Text variant="label" align="center">{st.label}</Text>
        </View>
      ))}
      <View style={styles.sticker} accessible accessibilityLabel="Keep exploring to find more stickers">
        <View style={[styles.stickerDisc, styles.stickerSpot]}>
          <IconPlus size={28} color={palette.navyMuted} />
        </View>
        <Text variant="label" align="center" color={palette.navyMuted}>Keep exploring</Text>
      </View>
    </View>
  );
}

// ── Finding card ─────────────────────────────────────────────────────────────

export type FindingCardProps = {
  question: string;
  /** The child's guess, without "I think" */
  guess: string;
  /** What the child found, without "I learned" */
  found: string;
  /** Nudge's grown-up explanation, kept short */
  fact: string;
  photo?: React.ReactNode;
  onNewAdventure?: () => void;
  onOpenJournal?: () => void;
};

/**
 * The end of an adventure. The child's guess sits next to what they found (that
 * comparison is the science), Nudge's explanation comes last as a fun fact, and the entry
 * is already saved, so the next step is a new adventure.
 */
export function FindingCard({ question, guess, found, fact, photo, onNewAdventure, onOpenJournal }: FindingCardProps) {
  const halves: { id: StepId; label: string; text: string }[] = [
    { id: 'hypothesize', label: 'My guess', text: guess },
    { id: 'reflect', label: 'What I found', text: found },
  ];
  return (
    <GraphPaper radius={radius.xxl} style={styles.finding}>
      <Tape tilt={4} style={styles.findingTape} />
      <FoundItOut large />

      <View style={styles.askedPanel}>
        <Text variant="body" color={palette.navyMuted} style={{ fontFamily: fontFamily[700] }}>You asked…</Text>
        <Text variant="heading" style={f(800, 24, 29)}>{question}</Text>
      </View>

      {photo ? <View style={styles.findingPhoto}><View style={styles.findingPhotoInner}>{photo}</View></View> : null}

      <View style={styles.halves}>
        {halves.map(h => {
          const s = getStep(h.id);
          const Icon = stepIcon[h.id];
          return (
            <View key={h.id} style={styles.half}>
              <View style={styles.halfHead}>
                <View style={[styles.halfCircle, { backgroundColor: s.bg }]}>
                  <Icon size={16} color={s.fg} />
                </View>
                <Text variant="label" color={palette.navyMuted} style={{ fontFamily: fontFamily[800] }}>{h.label}</Text>
              </View>
              <StarterLine stepId={h.id} line={h.text} style={f(500, 17, 23)} />
            </View>
          );
        })}
      </View>

      <View style={styles.fact}>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <IconSprout size={16} color={palette.navy} />
        </View>
        <View style={styles.factBody}>
          <Text variant="body">
            <Text variant="body" style={{ fontFamily: fontFamily[800] }}>Nudge's fun fact</Text>{'\n'}{fact}
          </Text>
          <ReadAloudButton text={`Nudge's fun fact. ${fact}`} />
        </View>
      </View>

      <View style={styles.allDone}>
        <Text variant="label" color={palette.navyMuted} style={{ fontFamily: fontFamily[800] }}>All 5 steps done!</Text>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <View style={[styles.dot, { backgroundColor: s.bg }]}>
                <IconCheck size={16} color={s.fg} />
              </View>
              {i < steps.length - 1 && <View style={styles.joiner} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.saved}>
        <IconCheck size={18} color="#2B5C5C" />
        <Text variant="label" color="#2B5C5C">Saved to your journal</Text>
      </View>

      <Button label="Start a new adventure" size="lg" fullWidth onPress={onNewAdventure}
        icon={({ color, size }) => <IconCompass size={size} color={color} />} />
      <Button label="Open my journal" variant="quiet" fullWidth onPress={onOpenJournal} />
    </GraphPaper>
  );
}

const styles = StyleSheet.create({
  // Cover
  cover: { paddingHorizontal: space[5], paddingVertical: 22 },
  coverTape: { top: -8, alignSelf: 'center' },
  coverHeading: { marginTop: 2, marginBottom: space[3] },
  foundPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: space[2], backgroundColor: palette.paper, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },

  sectionHeading: { paddingTop: space[2] },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: palette.paper, borderRadius: radius.lg, borderWidth: 1.5, borderColor: softEdge, paddingVertical: space[3], paddingLeft: 14, paddingRight: space[3] },
  pressed: { opacity: 0.85 },
  thumb: { width: 64, height: 64, borderRadius: 8, borderWidth: 4, borderColor: palette.white, boxShadow: '0px 1px 4px rgba(0, 54, 98, 0.2)', transform: [{ rotate: '-2deg' }] },
  thumbInner: { flex: 1, borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, minWidth: 0, gap: 2 },

  // Preview
  previewPress: { borderRadius: radius.xl },
  preview: { flexDirection: 'row', alignItems: 'center', gap: space[4], padding: space[4] },
  previewPhoto: { width: 88, height: 88, borderRadius: 10, borderWidth: 5, borderColor: palette.white, boxShadow: shadow.sticker },
  previewPhotoInner: { flex: 1, borderRadius: 5, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  previewTape: { position: 'absolute', top: -14, left: 18, width: 52, height: 18, backgroundColor: 'rgba(181,175,245,0.75)', transform: [{ rotate: '-6deg' }] },
  previewPanel: { flex: 1, minWidth: 0, gap: 6, backgroundColor: palette.paper, borderRadius: 14, paddingHorizontal: space[3], paddingVertical: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space[3], rowGap: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Count
  count: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: space[4], paddingVertical: 18, paddingLeft: 18, paddingRight: 26 },
  countTile: { width: 60, height: 60, borderRadius: 18, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center' },

  // Stickers
  stickers: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 18 },
  sticker: { width: 104, alignItems: 'center', gap: space[2] },
  stickerDisc: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  stickerEarned: { borderWidth: 4, borderColor: palette.white, boxShadow: shadow.sticker },
  stickerSpot: { borderWidth: 2.5, borderStyle: 'dashed', borderColor: palette.edge },

  // Finding
  finding: { paddingHorizontal: space[5], paddingVertical: 22, gap: 14 },
  findingTape: { top: -8, right: 40 },
  askedPanel: { backgroundColor: palette.paper, borderRadius: 12, marginHorizontal: -6, paddingHorizontal: 6, paddingVertical: 4 },
  findingPhoto: { height: 150, borderRadius: 12, borderWidth: 6, borderColor: palette.white, backgroundColor: palette.white, boxShadow: shadow.sticker, transform: [{ rotate: '-1.5deg' }] },
  findingPhotoInner: { flex: 1, borderRadius: 6, overflow: 'hidden' },
  halves: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, minWidth: 0, backgroundColor: palette.paper, borderRadius: radius.md, borderWidth: 1.5, borderColor: softEdge, padding: space[3], gap: 6 },
  halfHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  halfCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  fact: { flexDirection: 'row', gap: 10, backgroundColor: nudgeBubble, borderRadius: radius.lg, borderTopLeftRadius: 6, padding: 14 },
  avatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#B0D4D4', alignItems: 'center', justifyContent: 'center' },
  factBody: { flex: 1, alignItems: 'flex-start', gap: space[2] },
  allDone: { alignItems: 'center', gap: 6 },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  joiner: { width: 16, height: 3, borderRadius: 2, backgroundColor: palette.edge },
  saved: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

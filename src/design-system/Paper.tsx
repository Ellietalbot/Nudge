/**
 * Journal paper bits: graph paper, washi tape, the doodle pattern and the sunny star.
 * All decorative: hidden from screen readers and never catch touches.
 *
 * GraphPaper clips only its grid layer, so tape (or a photo corner) can stick out past
 * the card edge like it does in a real journal.
 */
import React, { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';

import { palette, radius as radii } from './tokens';

const gridMinor = 'rgba(0, 54, 98, 0.10)';
const gridMajor = 'rgba(0, 54, 98, 0.22)';
/** Border for graph-paper cards (a touch stronger than `hairline` so it shows over the grid). */
export const paperEdge = 'rgba(0, 54, 98, 0.12)';

function svgId(prefix: string, raw: string) {
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

const hidden = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants' as const,
  pointerEvents: 'none' as const,
};

export type GraphPaperProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Corner radius of the paper (default 24). */
  radius?: number;
};

/** Paper (#FBF8F2) with a 20px minor grid and a stronger line every 100px. */
export function GraphPaper({ children, style, radius = radii.xl }: GraphPaperProps) {
  const id = svgId('grid', useId());
  const minor = [20, 40, 60, 80];
  return (
    <View style={[styles.paper, { borderRadius: radius }, style]}>
      <View {...hidden} style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: Math.max(0, radius - 1.5) }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id={id} x={-1} y={-1} width={100} height={100} patternUnits="userSpaceOnUse">
              {minor.map(p => (
                <React.Fragment key={p}>
                  <Rect x={0} y={p} width={100} height={1} fill={gridMinor} />
                  <Rect x={p} y={0} width={1} height={100} fill={gridMinor} />
                </React.Fragment>
              ))}
              <Rect x={0} y={0} width={100} height={1} fill={gridMajor} />
              <Rect x={0} y={0} width={1} height={100} fill={gridMajor} />
            </Pattern>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
}

export type TapeProps = {
  /** Position it with top/left/right (it is absolutely positioned). */
  style?: StyleProp<ViewStyle>;
  color?: string;
  /** Degrees. */
  tilt?: number;
};

/** A 96×28 strip of washi tape: "taped into the journal". Use once per card at most. */
export function Tape({ style, color = 'rgba(181,175,245,0.7)', tilt = -3 }: TapeProps) {
  return (
    <View {...hidden} style={[styles.tape, { backgroundColor: color, transform: [{ rotate: `${tilt}deg` }] }, style]}>
      <Svg width={96} height={28}>
        <Line x1={1} y1={0} x2={1} y2={28} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="4 3" />
        <Line x1={95} y1={0} x2={95} y2={28} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="4 3" />
      </Svg>
    </View>
  );
}

/** Nudge's own science icons, drawn as 24×24 strokes. */
export const doodlePaths: Record<string, string> = {
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z',
  mag: 'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zM15.5 15.5 21 21',
  leaf: 'M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19 13 11',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  flask: 'M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 9V3M7 15h10',
  bug: 'M12 6a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0v-6a4 4 0 0 1 4-4zM12 6V4M9 3l1.5 2M15 3l-1.5 2M8 11H4M8 16H4M16 11h4M16 16h4',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  q: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
};

/** One 256×232 tile of the doodle pattern. */
export const doodleTile: { k: keyof typeof doodlePaths; c: string; x: number; y: number; r: number }[] = [
  { k: 'bulb', c: '#003662', x: 8, y: 8, r: -10 },   { k: 'mag', c: '#EB5921', x: 70, y: 10, r: 8 },
  { k: 'leaf', c: '#F2C14E', x: 132, y: 6, r: -18 }, { k: 'star', c: '#387070', x: 194, y: 10, r: 0 },
  { k: 'flask', c: '#B5AFF5', x: 38, y: 66, r: 15 }, { k: 'bug', c: '#B0D4D4', x: 100, y: 64, r: -10 },
  { k: 'sun', c: '#F2C14E', x: 162, y: 68, r: 0 },   { k: 'q', c: '#B0D4D4', x: 224, y: 64, r: 8 },
  { k: 'star', c: '#F2C14E', x: 8, y: 124, r: 12 },  { k: 'leaf', c: '#EB5921', x: 70, y: 122, r: -10 },
  { k: 'bulb', c: '#B5AFF5', x: 132, y: 126, r: 8 }, { k: 'mag', c: '#003662', x: 194, y: 122, r: -18 },
  { k: 'sun', c: '#387070', x: 38, y: 182, r: 0 },   { k: 'q', c: '#B5AFF5', x: 100, y: 180, r: 15 },
  { k: 'bug', c: '#EB5921', x: 162, y: 184, r: -10 }, { k: 'flask', c: '#F2C14E', x: 224, y: 180, r: 8 },
];

/**
 * Doodle pattern: fills its parent (absolutely). For onboarding, empty states and the
 * journal's inside cover. Never behind text a child has to read.
 */
export function DoodlePattern({ opacity = 1 }: { opacity?: number }) {
  const id = svgId('doodle', useId());
  return (
    <View {...hidden} style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} x={0} y={0} width={256} height={232} patternUnits="userSpaceOnUse">
            {doodleTile.map((d, i) => (
              <G key={i} transform={`translate(${d.x} ${d.y}) rotate(${d.r} 14 14) scale(1.17)`}>
                <Path d={doodlePaths[d.k]} fill="none" stroke={d.c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </G>
            ))}
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Sunny filled star with a navy edge. Celebration accent only. */
export function SunStar({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={palette.sunny} stroke={palette.navy} strokeWidth={2.2} strokeLinejoin="round"
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d={doodlePaths.star} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: palette.paper, borderWidth: 1.5, borderColor: paperEdge },
  clip: { overflow: 'hidden' },
  tape: { position: 'absolute', width: 96, height: 28, zIndex: 2 },
});

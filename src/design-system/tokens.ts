/**
 * Nudge design tokens: the single source of truth for colour, type, spacing, radii and
 * shadows. Components read from here; screens should too. Light mode only for the MVP.
 *
 * Rules that the tokens encode:
 * - Step colours tell you WHERE you are. They are never used on buttons or as status.
 * - Navy means "do this / selected". Sunny means "celebrate" or "safety". Nothing else is yellow.
 * - The press shadow is only for things you can tap.
 */

export const palette = {
  navy: '#003662', // all text, primary buttons, selected state
  navyPress: '#001A33',
  navyMuted: '#45597A', // secondary text
  cream: '#F4EEE4', // page background
  paper: '#FBF8F2', // cards
  sand: '#E9E2D6', // secondary buttons, app problems
  sandPress: '#D3CCBF',
  edge: '#7D879A', // 3:1 edge for fields, tiles, checkboxes (WCAG 1.4.11)
  white: '#FFFFFF',
  sunny: '#F2C14E', // celebrations + safety only. Navy on it, never white, never as text
  sunnyPale: '#FFF3CF',
} as const;

export type StepId = 'observe' | 'ask' | 'hypothesize' | 'investigate' | 'reflect';

export type Step = {
  id: StepId;
  num: 1 | 2 | 3 | 4 | 5;
  label: string;
  /** The child's sentence starter */
  prompt: string;
  /** Fill colour (circles, chips, progress) */
  bg: string;
  /** Text or icon colour ON `bg` */
  fg: string;
  /** Step-coloured text on cream/paper (passes 4.5:1) */
  text: string;
  /** Pale background for the step's own surfaces (e.g. the Guess card) */
  pale: string;
  /** Darker edge for raised things in this colour */
  press: string;
  /** Chip colours when `bg` is too bright for small text (Investigate) */
  chipBg?: string;
  chipFg?: string;
};

export const steps: readonly Step[] = [
  { id: 'observe', num: 1, label: 'Observe', prompt: 'I noticed', bg: '#B0D4D4', fg: '#003662', text: '#2B5C5C', pale: '#E2EFEF', press: '#6FA3A3' },
  { id: 'ask', num: 2, label: 'Ask', prompt: 'I wonder', bg: '#B5AFF5', fg: '#003662', text: '#4B3FB0', pale: '#ECEAFD', press: '#7D75D6' },
  { id: 'hypothesize', num: 3, label: 'Guess!', prompt: 'I think', bg: '#E89979', fg: '#003662', text: '#8A3E22', pale: '#F9E5DC', press: '#B86D52' },
  { id: 'investigate', num: 4, label: 'Investigate', prompt: 'I tried', bg: '#EB5921', fg: '#FFFFFF', text: '#A3330E', pale: '#FBE0D4', press: '#B23F12', chipBg: '#FBE0D4', chipFg: '#A3330E' },
  { id: 'reflect', num: 5, label: 'Reflect', prompt: 'I learned', bg: '#387070', fg: '#FFFFFF', text: '#24504F', pale: '#DCEAEA', press: '#24504F' },
] as const;

export function step(id: StepId): Step {
  return steps.find(s => s.id === id) ?? steps[0];
}

/** Chip colours for a step: Investigate uses its tint because white on bright orange
 *  only passes as 19px+ bold text. */
export function stepChip(s: Step) {
  return { bg: s.chipBg ?? s.bg, fg: s.chipFg ?? s.fg, border: s.chipBg ? s.bg : undefined };
}

/** Status never reuses a step colour. Success = navy "Got it"; info = Nudge talking. */
export const status = {
  problem: { bg: palette.sand, edge: palette.edge, iconBg: palette.paper, text: palette.navy }, // the app hiccuped
  safety: { bg: palette.sunny, edge: palette.navy, body: palette.paper, text: palette.navy }, // stop and listen
} as const;

/** Nudge's chat bubble is always lavender. */
export const nudgeBubble = '#ECEAFD';
export const childBubble = palette.navy;

/** Figtree via @expo-google-fonts/figtree (see fonts.ts). */
export const fontFamily = {
  500: 'Figtree_500Medium',
  700: 'Figtree_700Bold',
  800: 'Figtree_800ExtraBold',
  900: 'Figtree_900Black',
} as const;

/**
 * Type scale for 6–8 year olds. Reading text is 19px. No italics, no all-caps.
 * Display is for one line per screen.
 */
export const type = {
  display: { fontFamily: fontFamily[900], fontSize: 40, lineHeight: 44 },
  heading: { fontFamily: fontFamily[800], fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fontFamily[800], fontSize: 21, lineHeight: 27 },
  reading: { fontFamily: fontFamily[500], fontSize: 19, lineHeight: 29 },
  button: { fontFamily: fontFamily[800], fontSize: 19, lineHeight: 24 },
  chip: { fontFamily: fontFamily[700], fontSize: 18, lineHeight: 23 },
  body: { fontFamily: fontFamily[500], fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fontFamily[700], fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fontFamily[500], fontSize: 14, lineHeight: 19 },
} as const;

export type TypeVariant = keyof typeof type;

/** 4px base unit. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 } as const;

export const radius = { sm: 10, md: 16, lg: 20, xl: 24, xxl: 28, pill: 999 } as const;

/** Touch targets: 80 large, 60 medium; everything gets a 76px hit area (hitSlop). */
export const size = { large: 80, medium: 60, minHit: 76 } as const;

/** hitSlop that grows a control of `h` points tall to at least 76. */
export function hitSlopFor(h: number) {
  const pad = Math.max(0, Math.ceil((size.minHit - h) / 2));
  return { top: pad, bottom: pad, left: pad, right: pad };
}

/**
 * Shadows (React Native `boxShadow`, new architecture).
 * `press` is ONLY for tappable things: a raised look always means "tap me".
 */
export const shadow = {
  press: (color: string, y = 5) => `0px ${y}px 0px ${color}`,
  card: '0px 4px 20px rgba(0, 54, 98, 0.10)',
  floating: '0px 12px 40px rgba(0, 54, 98, 0.18)',
  modal: '0px 24px 60px rgba(0, 54, 98, 0.35)',
  sticker: '0px 2px 6px rgba(0, 54, 98, 0.18)',
} as const;

/** One focus ring everywhere: 3px navy, 3px gap. */
export const focusRing = { outlineWidth: 3, outlineColor: palette.navy, outlineOffset: 3, outlineStyle: 'solid' } as const;

/** Thin border used on cream cards. */
export const hairline = 'rgba(0, 54, 98, 0.10)';

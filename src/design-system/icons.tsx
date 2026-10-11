/**
 * Nudge icon set: 24×24 stroke icons (react-native-svg).
 * `color` sets the stroke (or fill for the two solid icons). Icons are decorative by
 * default; pass `label` when an icon is the only thing that explains a control.
 */
import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export type IconProps = { size?: number; color?: string; strokeWidth?: number; label?: string };

function make(children: React.ReactNode, opts: { solid?: boolean; strokeWidth?: number } = {}) {
  return function Icon({ size = 24, color = '#003662', strokeWidth, label }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={opts.solid ? color : 'none'}
        stroke={opts.solid ? 'none' : color} strokeWidth={strokeWidth ?? opts.strokeWidth ?? 2.5}
        strokeLinecap="round" strokeLinejoin="round"
        accessible={!!label} accessibilityLabel={label} accessibilityElementsHidden={!label} importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}>
        {children}
      </Svg>
    );
  };
}

export const IconEye = make(<><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><Circle cx="12" cy="12" r="3"/></>);
export const IconQuestion = make(<><Circle cx="12" cy="12" r="10"/><Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><Line x1="12" y1="17" x2="12.01" y2="17"/></>);
export const IconLightbulb = make(<><Line x1="9" y1="18" x2="15" y2="18"/><Line x1="10" y1="22" x2="14" y2="22"/><Path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></>);
export const IconFlask = make(<><Path d="M9 3h6M9 3v7l-4 9h14L15 10V3"/></>);
export const IconSprout = make(<><Path d="M12 21V11"/><Path d="M12 13C12 9 9 7 5 7c0 4 3 6 7 6z"/><Path d="M12 11c0-4 3-6 7-6 0 4-3 6-7 6z"/></>);
export const IconLoopBack = make(<><Path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><Path d="M21 3v5h-5"/></>);
export const IconBug = make(<><Rect x="8" y="6" width="8" height="14" rx="4"/><Path d="M12 6V4M9 3l1.5 2M15 3l-1.5 2M8 11H4M8 16H4M16 11h4M16 16h4"/></>, { strokeWidth: 2.4 });
export const IconSun = make(<><Circle cx="12" cy="12" r="4"/><Path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>, { strokeWidth: 2.4 });
export const IconPlus = make(<><Path d="M12 5v14M5 12h14"/></>, { strokeWidth: 2.6 });
export const IconMic = make(<><Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><Path d="M19 10v2a7 7 0 0 1-14 0v-2"/><Line x1="12" y1="19" x2="12" y2="23"/><Line x1="8" y1="23" x2="16" y2="23"/></>);
export const IconCamera = make(<><Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><Circle cx="12" cy="13" r="4"/></>);
export const IconVolume = make(<><Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><Path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><Path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>);
export const IconStop = make(<><Rect x="4" y="4" width="16" height="16" rx="3"/></>, { solid: true });
export const IconCheck = make(<><Polyline points="20 6 9 17 4 12"/></>, { strokeWidth: 3 });
export const IconStar = make(<><Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, { solid: true });
export const IconLock = make(<><Rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><Path d="M7 11V7a5 5 0 0 1 10 0v4"/></>);
export const IconInfo = make(<><Circle cx="12" cy="12" r="10"/><Path d="M12 16v-4M12 8h.01"/></>);
export const IconChip = make(<><Rect x="5" y="5" width="14" height="14" rx="3"/><Path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></>);
export const IconMapPin = make(<><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><Circle cx="12" cy="10" r="3"/></>);
export const IconCalendar = make(<><Rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><Line x1="16" y1="2" x2="16" y2="6"/><Line x1="8" y1="2" x2="8" y2="6"/><Line x1="3" y1="10" x2="21" y2="10"/></>);
export const IconBookOpen = make(<><Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>);
export const IconPencil = make(<><Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>);
export const IconChevronRight = make(<><Polyline points="9 18 15 12 9 6"/></>);
export const IconCameraOff = make(<><Path d="M3 7h3l2-3h8l2 3h3v13H3z"/><Circle cx="12" cy="13" r="4"/><Path d="M3 3l18 18"/></>, { strokeWidth: 2.4 });
export const IconCloudOff = make(<><Path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/><Path d="M3 3l18 18"/></>, { strokeWidth: 2.4 });
export const IconCompass = make(<><Circle cx="12" cy="12" r="10"/><Polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>);
export const IconArrowLeft = make(<><Line x1="19" y1="12" x2="5" y2="12"/><Polyline points="12 19 5 12 12 5"/></>);
export const IconAlertTriangle = make(<><Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><Line x1="12" y1="9" x2="12" y2="13"/><Line x1="12" y1="17" x2="12.01" y2="17"/></>);
export const IconHandStop = make(<><Path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><Path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><Path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><Path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></>);
export const IconUserCheck = make(<><Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><Circle cx="8.5" cy="7" r="4"/><Polyline points="17 11 19 13 23 9"/></>);
export const IconShield = make(<><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>);
export const IconTimer = make(<><Circle cx="12" cy="13" r="8"/><Path d="M12 9v4l2 2"/><Path d="M5 3 2 6"/><Path d="M22 6l-3-3"/><Path d="M6.38 18.7 4 21"/><Path d="M17.64 18.67 20 21"/></>);
export const IconLoader = make(<><Path d="M21 12a9 9 0 1 1-6.219-8.56"/><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></>);
export const IconSearch = make(<><Circle cx="11" cy="11" r="8"/><Line x1="21" y1="21" x2="16.65" y2="16.65"/></>);

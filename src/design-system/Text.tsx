/**
 * Text with the Nudge type scale. Use `variant` instead of setting font sizes by hand.
 * Text scales with the phone's text-size setting (allowFontScaling stays on), so never
 * put text in a fixed-height box.
 */
import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { palette, type as typeScale, type TypeVariant } from './tokens';

export type NTextProps = TextProps & {
  variant?: TypeVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function Text({ variant = 'reading', color = palette.navy, align, style, ...rest }: NTextProps) {
  const isHeading = variant === 'display' || variant === 'heading' || variant === 'title';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={2}
      style={[typeScale[variant], { color, textAlign: align }, style]}
      {...rest}
    />
  );
}

import type React from 'react';

import { IconEye, IconFlask, IconLightbulb, IconQuestion, IconSprout, type IconProps } from './icons';
import type { StepId } from './tokens';

/** The icon for each step. Always shown with the step's colour and its name. */
export const stepIcon: Record<StepId, (p: IconProps) => React.ReactElement> = {
  observe: IconEye,
  ask: IconQuestion,
  hypothesize: IconLightbulb,
  investigate: IconFlask,
  reflect: IconSprout,
};

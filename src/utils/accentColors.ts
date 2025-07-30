import type { AccentColor } from '../types/settings';

export const ACCENT_COLOR_VALUES: Record<AccentColor, string> = {
  orange: '#FF7101',
  blue: '#06B6D4', 
  green: '#10B981',
  purple: '#8B5CF6',
  red: '#DC2626',
  yellow: '#F59E0B'
};

/**
 * Gets the hex value for the current accent color
 */
export function getAccentColorValue(accentColor: AccentColor): string {
  return ACCENT_COLOR_VALUES[accentColor] || ACCENT_COLOR_VALUES.orange;
}

/**
 * Gets the CSS variable fallback string for accent color
 */
export function getAccentColorCSS(accentColor: AccentColor): string {
  return `var(--accent-color, ${getAccentColorValue(accentColor)})`;
}
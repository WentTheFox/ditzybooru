/**
 * Theme settings: the {@link ThemeLightness} (light/dark) the visitor picks,
 * and the {@link ThemeColor} accent a site is configured with.
 *
 * What the visitor picks is a {@link ThemeLightnessPreference} - `light`,
 * `dark`, or `system`. Only an explicit light/dark reaches `<html>`, as
 * `data-theme`; `system` is stored as nothing at all, which leaves the
 * stylesheet's `prefers-color-scheme` branch in charge. That is what lets the
 * server render the right theme for a first-time visitor without knowing
 * anything about their machine.
 *
 * The accent is not a visitor setting: each site names one (`Site.themeColor`)
 * and `<html data-accent>` applies it. See `styles/accents.css`.
 *
 * Persistence and the store live in `lib/settings` and `lib/settings-store`.
 */

export type ThemeLightness = 'light' | 'dark';

/** What the visitor chose. `system` follows `prefers-color-scheme` as it changes. */
export type ThemeLightnessPreference = ThemeLightness | 'system';

export type ThemeColor = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'gray';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const DEFAULT_THEME_LIGHTNESS_PREFERENCE: ThemeLightnessPreference = 'system';

/** The accents a site can name. Blue is the package default; the rest are
 *  generated into `styles/accents.css`. */
export const THEME_COLORS: Array<{ id: ThemeColor }> = [
  { id: 'red' },
  { id: 'orange' },
  { id: 'yellow' },
  { id: 'green' },
  { id: 'teal' },
  { id: 'blue' },
  { id: 'purple' },
  { id: 'pink' },
  { id: 'gray' },
];

/**
 * What `system` currently resolves to. Browser only. Read through
 * `useSyncExternalStore` with {@link subscribeSystemLightness}, whose server
 * snapshot is `undefined`: the server cannot know the answer, and a guess is a
 * wrong state drawn for one frame.
 */
export function resolveSystemLightness(): ThemeLightness {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

/**
 * The preference to store for a chosen state.
 *
 * Choosing the state that `system` already resolves to stores `system` rather
 * than an explicit override, so light-then-dark on a dark machine lands back on
 * the default rather than on a pinned value that merely looks like it.
 */
export function preferredLightness(lightness: ThemeLightnessPreference): ThemeLightnessPreference {
  return lightness === resolveSystemLightness() ? 'system' : lightness;
}

export function subscribeSystemLightness(listener: () => void): () => void {
  const media = window.matchMedia(DARK_SCHEME_QUERY);
  media.addEventListener('change', listener);
  return () => {
    media.removeEventListener('change', listener);
  };
}

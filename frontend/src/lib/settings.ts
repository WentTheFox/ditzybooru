/**
 * Every visitor-chosen setting, and the one cookie that carries them.
 *
 * A cookie rather than `localStorage` because the server renders the page: the
 * light/dark choice decides `<html>`'s attributes, so it has to arrive with the
 * request or the first paint is wrong.
 *
 * Only values differing from the shipped defaults are written, so the cookie
 * stays small - it rides on every same-origin request, `/assets/*` included.
 * `system` lightness is an absence, left to `prefers-color-scheme` in the
 * stylesheet.
 */

import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';

import { DATA_SOURCE_KINDS } from '#/lib/api/types';
import { CLOUDFLARE_PRODUCTION } from '#/lib/deploy';
import type { DataSourceKind } from '#/lib/api/types';
import { DEFAULT_THEME_LIGHTNESS_PREFERENCE } from '#/lib/theme';
import type { ThemeColor, ThemeLightness, ThemeLightnessPreference } from '#/lib/theme';

export interface Settings {
  lightness: ThemeLightnessPreference;
  /** Which backend the site reads from. A developer setting, offered on
   *  `/settings/developer`. */
  dataSource: DataSourceKind;
}

function defaultSettings(): Settings {
  return {
    lightness: DEFAULT_THEME_LIGHTNESS_PREFERENCE,
    dataSource: CLOUDFLARE_PRODUCTION ? 'mock-anonymous' : 'live',
  };
}

const SETTINGS_COOKIE = 'ditzy-settings';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** What `settingsAttributes` puts on `<html>`. */
export interface SettingsAttributes {
  'data-theme'?: ThemeLightness;
  'data-accent': ThemeColor;
}

/**
 * The `<html>` attributes the settings and the site's accent produce, on the
 * server and on the client alike - which is what makes the two renders agree.
 *
 * `system` is an absent `data-theme`, which lets the stylesheet's
 * `prefers-color-scheme` branch apply to a visitor who has never chosen.
 */
export function settingsAttributes(settings: Settings, accent: ThemeColor): SettingsAttributes {
  return {
    ...(settings.lightness === 'system' ? {} : { 'data-theme': settings.lightness }),
    'data-accent': accent,
  };
}

function isThemeLightnessPreference(value: unknown): value is ThemeLightnessPreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isDataSourceKind(value: unknown): value is DataSourceKind {
  return DATA_SOURCE_KINDS.some(kind => kind === value);
}

/** Rejects anything a control could not have produced, so a hand-edited cookie
 *  can never reach the markup as something absurd. */
function parseSettings(raw: string | undefined): Settings {
  const defaults = defaultSettings();
  if (raw === undefined) {
    return defaults;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return defaults;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return defaults;
  }

  const stored = parsed as Partial<Record<keyof Settings, unknown>>;
  return {
    lightness: isThemeLightnessPreference(stored.lightness) ? stored.lightness : defaults.lightness,
    dataSource: isDataSourceKind(stored.dataSource) ? stored.dataSource : defaults.dataSource,
  };
}

function settingsPayload(settings: Settings): Record<string, unknown> {
  const defaults = defaultSettings();
  return {
    ...(settings.lightness === defaults.lightness ? {} : { lightness: settings.lightness }),
    ...(settings.dataSource === defaults.dataSource ? {} : { dataSource: settings.dataSource }),
  };
}

function readCookieFromDocument(name: string): string | undefined {
  const prefix = `${name}=`;
  for (const entry of document.cookie.split('; ')) {
    if (entry.startsWith(prefix)) {
      return entry.slice(prefix.length);
    }
  }
  return undefined;
}

/**
 * The settings for the request being rendered.
 *
 * Isomorphic on purpose: the server branch is stripped from the client bundle,
 * and both sides read the same cookie, so the server's markup and the client's
 * first render agree. Reading it per request rather than once per module keeps
 * one visitor's settings out of the next visitor's response.
 */
export const readSettings = createIsomorphicFn()
  .server(() => parseSettings(getCookie(SETTINGS_COOKIE)))
  .client(() => parseSettings(readCookieFromDocument(SETTINGS_COOKIE)));

/** Not `HttpOnly`: the settings UI is what writes this. `SameSite=Lax` keeps it
 *  off cross-site requests, and an all-defaults set clears it outright. */
export function writeSettingsCookie(settings: Settings): void {
  const payload = settingsPayload(settings);
  if (Object.keys(payload).length === 0) {
    document.cookie = `${SETTINGS_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
    return;
  }

  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const value = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${SETTINGS_COOKIE}=${value}; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}${secure}`;
}

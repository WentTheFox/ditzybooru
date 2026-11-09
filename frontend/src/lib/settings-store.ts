/**
 * The settings as a subscribable value.
 *
 * A module-level store rather than component state, because the settings are
 * one global thing with more than one view of them on screen at once.
 *
 * The store is client-only. On the server the settings come from the root
 * route's context instead, one read per request: a module-level value would be
 * shared by every request the isolate handles.
 */

import type { DataSourceKind } from '#/lib/api/types';
import { readSettings, writeSettingsCookie } from '#/lib/settings';
import type { Settings } from '#/lib/settings';
import { preferredLightness } from '#/lib/theme';
import type { ThemeLightnessPreference } from '#/lib/theme';

let current: Settings | undefined;
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  current ??= readSettings();
  return current;
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Persists and publishes a change. React re-renders `<html>` from the store,
 *  so nothing here touches the DOM. */
function updateSettings(change: (settings: Settings) => Settings): void {
  current = change(getSettings());
  writeSettingsCookie(current);
  for (const listener of listeners) listener();
}

export function setThemeLightnessPreference(lightness: ThemeLightnessPreference): void {
  updateSettings(settings => ({ ...settings, lightness: preferredLightness(lightness) }));
}

export function setDataSource(dataSource: DataSourceKind): void {
  updateSettings(settings => ({ ...settings, dataSource }));
}

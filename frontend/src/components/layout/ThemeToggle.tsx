import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

import { burgerItemClass } from '#/components/philomena/Burger';
import { NavbarIcon, NavbarItem } from '#/components/philomena/Navbar';
import { useSettings } from '#/hooks/use-settings';
import { setThemeLightnessPreference } from '#/lib/settings-store';
import { resolveSystemLightness, subscribeSystemLightness } from '#/lib/theme';
import type { ThemeLightness } from '#/lib/theme';

/**
 * The lightness in force: the visitor's explicit choice, or whatever the system
 * resolves to. `undefined` until hydration, because the server cannot know what
 * `system` means and a guess would draw the wrong state for a frame.
 */
function useEffectiveLightness(): ThemeLightness | undefined {
  const { lightness } = useSettings();
  const system = useSyncExternalStore(subscribeSystemLightness, resolveSystemLightness, () => undefined);
  return lightness === 'system' ? system : lightness;
}

function useToggleLightness(): { dark: boolean; toggle: () => void } {
  const lightness = useEffectiveLightness();
  return {
    dark: lightness === 'dark',
    toggle: () => {
      setThemeLightnessPreference(lightness === 'dark' ? 'light' : 'dark');
    },
  };
}

/** The header's light/dark switch. A pressed button: pressed means the dark theme. */
export function ThemeToggle() {
  const { dark, toggle } = useToggleLightness();

  return (
    <NavbarItem
      as="button"
      type="button"
      title="Dark theme"
      aria-label="Dark theme"
      aria-pressed={dark}
      onClick={toggle}
    >
      <NavbarIcon>{dark ? <Moon size={16} /> : <Sun size={16} />}</NavbarIcon>
    </NavbarItem>
  );
}

/** The same switch as a row of the burger menu. */
export function ThemeToggleBurgerItem() {
  const { dark, toggle } = useToggleLightness();

  return (
    <button type="button" className={burgerItemClass()} aria-pressed={dark} onClick={toggle}>
      <span className="burger-icon">{dark ? <Moon size={16} /> : <Sun size={16} />}</span>
      Dark theme
    </button>
  );
}

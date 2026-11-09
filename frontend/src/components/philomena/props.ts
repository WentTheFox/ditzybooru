import type { ComponentProps, JSX } from 'react';

import type { ClassValue } from '#/lib/utils';

/**
 * Props of an intrinsic element, with `className` narrowed to the `cn` input so
 * every component below composes classes the same way.
 */
export type PropsOf<TElement extends keyof JSX.IntrinsicElements> = Omit<ComponentProps<TElement>, 'className'> & {
  className?: ClassValue;
};

/** The semantic color types PhilomenaCSS builds `{component}-{type}` variants from. */
export type ColorType = 'primary' | 'success' | 'warning' | 'danger' | 'special' | 'light' | 'dark';

/** `{prefix}-{type}`, or nothing for the neutral default. */
export function colorClass(prefix: string, type: ColorType | undefined): string | undefined {
  return type === undefined ? undefined : `${prefix}-${type}`;
}

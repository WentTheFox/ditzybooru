import type { ElementType } from 'react';

import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/**
 * A one-row bar. Below the `md` breakpoint only the `NavbarBurger` item and
 * `pinned` items stay.
 */
export function Navbar({ className, ...props }: PropsOf<'nav'>) {
  return <nav className={cn('navbar', className)} {...props} />;
}

type NavbarItemProps<TElement extends ElementType> = {
  as?: TElement;
  /** A caret after the label, for the trigger of a `NavbarDropdown`. */
  caret?: boolean;
  /** Stays on narrow screens. */
  pinned?: boolean;
  current?: boolean;
  /** Hides the label's text below the `xl` (or `lg`) breakpoint. */
  hiddenBelow?: 'lg' | 'xl';
  className?: PropsOf<'a'>['className'];
} & Omit<React.ComponentProps<TElement>, 'as' | 'caret' | 'pinned' | 'current' | 'hiddenBelow' | 'className'>;

/** A link in the bar. Render as `button` or `label` through `as` when it is not a link. */
export function NavbarItem<TElement extends ElementType = 'a'>({
  as,
  caret = false,
  pinned = false,
  current = false,
  hiddenBelow,
  className,
  ...props
}: NavbarItemProps<TElement>) {
  const Component: ElementType = as ?? 'a';
  return (
    <Component
      className={cn(
        'navbar-item',
        caret && 'caret',
        pinned && 'navbar-pinned',
        current && 'current',
        hiddenBelow !== undefined && `hidden-below-${hiddenBelow}`,
        className,
      )}
      {...props}
    />
  );
}

/** The item that opens a `Burger`: a `label` for its `BurgerToggle`, shown only on narrow screens. */
export function NavbarBurger({ className, ...props }: PropsOf<'label'>) {
  return <label className={cn('navbar-item', 'navbar-burger', className)} {...props} />;
}

export function NavbarIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('navbar-icon', className)} aria-hidden="true" {...props} />;
}

/** Pushes the items after it to the end of the bar. */
export function NavbarSpacer({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('navbar-spacer', className)} {...props} />;
}

/** Wraps an item and a `NavbarMenu`. Opens on hover and focus; `open` holds it open (touch screens). */
export function NavbarDropdown({
  open = false,
  pinned = false,
  className,
  ...props
}: PropsOf<'div'> & { open?: boolean; pinned?: boolean }) {
  return <div className={cn('navbar-dropdown', open && 'open', pinned && 'navbar-pinned', className)} {...props} />;
}

export function NavbarMenu({ end = false, className, ...props }: PropsOf<'div'> & { end?: boolean }) {
  return <div className={cn('navbar-menu', end && 'end', className)} {...props} />;
}

type NavbarMenuItemProps<TElement extends ElementType> = {
  as?: TElement;
  current?: boolean;
  className?: PropsOf<'a'>['className'];
} & Omit<React.ComponentProps<TElement>, 'as' | 'current' | 'className'>;

export function NavbarMenuItem<TElement extends ElementType = 'a'>({
  as,
  current = false,
  className,
  ...props
}: NavbarMenuItemProps<TElement>) {
  const Component: ElementType = as ?? 'a';
  return <Component className={cn('navbar-menu-item', current && 'current', className)} {...props} />;
}

export function NavbarMenuIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('navbar-menu-icon', className)} aria-hidden="true" {...props} />;
}

export function NavbarMenuText({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('navbar-menu-text', className)} {...props} />;
}

export function NavbarMenuDivider({ className, ...props }: PropsOf<'hr'>) {
  return <hr className={cn('navbar-menu-divider', className)} {...props} />;
}

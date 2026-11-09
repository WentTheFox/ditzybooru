import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/**
 * The hidden checkbox that drives a script-free burger menu. Place it before
 * the `Burger` and `BurgerOverlay`, and point `label`s (`NavbarBurger`, a
 * `Button as="label"`, `BurgerClose`) at its `id`.
 */
export function BurgerToggle({ className, ...props }: PropsOf<'input'>) {
  return <input type="checkbox" className={cn('burger-toggle', className)} {...props} />;
}

/** The panel that slides in from the start side. `open` is for script-driven use. */
export function Burger({ open = false, className, ...props }: PropsOf<'div'> & { open?: boolean }) {
  return <div className={cn('burger', open && 'open', className)} {...props} />;
}

export function BurgerOverlay({ open = false, className, ...props }: PropsOf<'label'> & { open?: boolean }) {
  return <label className={cn('burger-overlay', open && 'open', className)} {...props} />;
}

export function BurgerHeader({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('burger-header', className)} {...props} />;
}

export function burgerCloseClass(): string {
  return 'burger-close';
}

/** A label for the toggle, or give it `onClick` and render it as a button through the `as` of your own. */
export function BurgerClose({ className, ...props }: PropsOf<'label'>) {
  return <label className={cn(burgerCloseClass(), className)} {...props} />;
}

export function burgerItemClass(current = false): string {
  return cn('burger-item', current && 'current');
}

export function BurgerItem({ current = false, className, ...props }: PropsOf<'a'> & { current?: boolean }) {
  return <a className={cn(burgerItemClass(current), className)} {...props} />;
}

export function BurgerIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('burger-icon', className)} aria-hidden="true" {...props} />;
}

export function BurgerDivider({ className, ...props }: PropsOf<'hr'>) {
  return <hr className={cn('burger-divider', className)} {...props} />;
}

import type { ElementType } from 'react';

import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/**
 * Wraps any trigger and a `DropdownMenu`. Opens on hover and focus without a
 * script; `open` holds it open and `manual` turns the hover off.
 */
export function Dropdown({
  open = false,
  manual = false,
  className,
  ...props
}: PropsOf<'div'> & { open?: boolean; manual?: boolean }) {
  return <div className={cn('dropdown', open && 'open', manual && 'manual', className)} {...props} />;
}

/**
 * The click-to-open form: a native `details` whose `summary` carries the
 * `button` class (`<Button as="summary">`). Use `manual` to skip hover opening.
 */
export function DropdownDetails({ manual = false, className, ...props }: PropsOf<'details'> & { manual?: boolean }) {
  return <details className={cn('dropdown', manual && 'manual', className)} {...props} />;
}

export function DropdownMenu({
  end = false,
  up = false,
  className,
  ...props
}: PropsOf<'div'> & { end?: boolean; up?: boolean }) {
  return <div className={cn('dropdown-menu', end && 'end', up && 'up', className)} {...props} />;
}

type DropdownItemProps<TElement extends ElementType> = {
  as?: TElement;
  current?: boolean;
  danger?: boolean;
  className?: PropsOf<'a'>['className'];
} & Omit<React.ComponentProps<TElement>, 'as' | 'current' | 'danger' | 'className'>;

/** A link by default; `as="button"` or `as="label"` (for a `MenuCheck` or `MenuSwitch`) otherwise. */
export function DropdownItem<TElement extends ElementType = 'a'>({
  as,
  current = false,
  danger = false,
  className,
  ...props
}: DropdownItemProps<TElement>) {
  const Component: ElementType = as ?? 'a';
  return (
    <Component
      className={cn('dropdown-item', current && 'current', danger && 'dropdown-danger', className)}
      {...props}
    />
  );
}

export function DropdownIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('dropdown-icon', className)} aria-hidden="true" {...props} />;
}

export function DropdownDivider({ className, ...props }: PropsOf<'hr'>) {
  return <hr className={cn('dropdown-divider', className)} {...props} />;
}

/** A row of buttons at the end of a menu, such as Apply and Clear. */
export function DropdownActions({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('dropdown-actions', className)} {...props} />;
}

/**
 * A checkbox or radio drawn in CSS for a `DropdownItem as="label"` or a navbar
 * menu item: the row toggles it. `end` puts the box after the text.
 */
export function MenuCheck({
  type = 'checkbox',
  end = false,
  className,
  ...props
}: Omit<PropsOf<'input'>, 'type'> & { type?: 'checkbox' | 'radio'; end?: boolean }) {
  return (
    <>
      <input type={type} className={cn('menu-check-input', className)} {...props} />
      <span className={cn('menu-check-box', end && 'menu-end')} aria-hidden="true" />
    </>
  );
}

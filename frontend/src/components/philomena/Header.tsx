import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** The page header. Sticky unless `nonStick`. Holds a `HeaderBrand`, then a `Nav` or `Navbar`. */
export function Header({ nonStick = false, className, ...props }: PropsOf<'header'> & { nonStick?: boolean }) {
  return <header className={cn('header', nonStick && 'non-stick', className)} {...props} />;
}

export function HeaderBrand({ className, ...props }: PropsOf<'a'>) {
  return <a className={cn('header-brand', className)} {...props} />;
}

export function HeaderBrandText({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('header-brand-text', className)} {...props} />;
}

/** A column of links, or a row with `horizontal`. */
export function Nav({ horizontal = false, className, ...props }: PropsOf<'nav'> & { horizontal?: boolean }) {
  return <nav className={cn('nav', horizontal && 'horizontal', className)} {...props} />;
}

export function NavLink({ current = false, className, ...props }: PropsOf<'a'> & { current?: boolean }) {
  return (
    <a
      className={cn('nav-link', current && 'current', className)}
      aria-current={current ? 'page' : undefined}
      {...props}
    />
  );
}

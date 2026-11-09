import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

export function Pagination({
  type,
  className,
  ...props
}: PropsOf<'nav'> & { type?: Extract<ColorType, 'primary' | 'success' | 'special'> }) {
  return (
    <nav aria-label="Pagination" className={cn('pagination', colorClass('pagination', type), className)} {...props} />
  );
}

function paginationLinkClass(current: boolean, disabled: boolean): string {
  return cn('pagination-link', current && 'current', disabled && 'disabled');
}

/**
 * One page link. Without an `href`, or when `disabled`, it renders a `span`:
 * the unavailable state. `current` marks the page being shown.
 */
export function PaginationLink({
  current = false,
  disabled = false,
  href,
  className,
  children,
  ...props
}: PropsOf<'a'> & { current?: boolean; disabled?: boolean }) {
  const classes = cn(paginationLinkClass(current, disabled), className);
  if (href === undefined || disabled) {
    return (
      <span className={classes} aria-disabled={disabled || undefined}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={classes} aria-current={current ? 'page' : undefined} {...props}>
      {children}
    </a>
  );
}

/** A glyph or icon slot next to a link's text. Only links with one stay visible on narrow screens. */
export function PaginationIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('pagination-icon', className)} aria-hidden="true" {...props} />;
}

export function PaginationGap({ className, children = '…', ...props }: PropsOf<'span'>) {
  return (
    <span className={cn('pagination-gap', className)} {...props}>
      {children}
    </span>
  );
}

/** Lays a `Pagination` out next to a `PaginationInfo` text. */
export function PaginationBar({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('pagination-bar', className)} {...props} />;
}

export function PaginationInfo({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('pagination-info', className)} {...props} />;
}

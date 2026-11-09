import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

export function Badge({ type, className, ...props }: PropsOf<'span'> & { type?: ColorType }) {
  return <span className={cn('badge', colorClass('badge', type), className)} {...props} />;
}

/** Content with a differently-tinted start or end cap, e.g. a label and its count. */
export function BadgePrefix({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('badge-prefix', className)} {...props} />;
}

export function BadgeSuffix({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('badge-suffix', className)} {...props} />;
}

export function BadgeGroup({ compact = false, className, ...props }: PropsOf<'span'> & { compact?: boolean }) {
  return <span className={cn('badge-group', compact && 'compact', className)} {...props} />;
}

/** A small pill with a number. `subtle` is a shaded chip for bars and buttons. */
export function Counter({
  type,
  subtle = false,
  corner = false,
  className,
  ...props
}: PropsOf<'span'> & { type?: ColorType; subtle?: boolean; corner?: boolean }) {
  return (
    <span
      className={cn('counter', colorClass('counter', type), subtle && 'subtle', corner && 'corner', className)}
      {...props}
    />
  );
}

/** Holds an icon; a `Counter` with `corner` inside pins to its corner as an unread badge. */
export function CounterAnchor({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('counter-anchor', className)} {...props} />;
}

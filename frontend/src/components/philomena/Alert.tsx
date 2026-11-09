import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

/** A message block. Neutral unless given a `type`. */
export function Alert({
  type,
  compact = false,
  className,
  ...props
}: PropsOf<'div'> & { type?: ColorType; compact?: boolean }) {
  return (
    <div role="alert" className={cn('alert', colorClass('alert', type), compact && 'compact', className)} {...props} />
  );
}

export function AlertIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('alert-icon', className)} {...props} />;
}

export function AlertContent({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('alert-content', className)} {...props} />;
}

export function AlertTitle({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('alert-title', className)} {...props} />;
}

export function AlertText({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('alert-text', className)} {...props} />;
}

export function AlertActions({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('alert-actions', className)} {...props} />;
}

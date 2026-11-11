import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

/**
 * A flat tinted bar of text and links, as Philomena's flash notices. Neutral
 * unless given a `type`. Pass `role="alert"` for one that must be announced.
 */
export function Alert({ type, className, ...props }: PropsOf<'div'> & { type?: ColorType }) {
  return <div className={cn('alert', colorClass('alert', type), className)} {...props} />;
}

/** Goes first; floats beside the text so that `AlertText` becomes a column next to it. */
export function AlertIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('alert-icon', className)} {...props} />;
}

export function AlertText({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('alert-text', className)} {...props} />;
}

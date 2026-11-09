import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

/** A square thumbnail. `cover` crops the image to fill instead of fitting inside. */
export function MediaBox({
  cover = false,
  muted = false,
  spoilered = false,
  type,
  className,
  ...props
}: PropsOf<'div'> & {
  cover?: boolean;
  muted?: boolean;
  spoilered?: boolean;
  type?: Extract<ColorType, 'danger' | 'success' | 'warning' | 'primary' | 'special'>;
}) {
  return (
    <div
      className={cn(
        'media-box',
        cover && 'cover',
        muted && 'muted',
        spoilered && 'spoilered',
        colorClass('media', type),
        className,
      )}
      {...props}
    />
  );
}

/** The bar above the picture. `actions` makes it a row of `MediaBoxAction`s and a score; `start` aligns it to the start. */
export function MediaBoxHeader({
  actions = false,
  start = false,
  className,
  ...props
}: PropsOf<'div'> & { actions?: boolean; start?: boolean }) {
  return <div className={cn('media-box-header', actions && 'actions', start && 'start', className)} {...props} />;
}

type MediaBoxActionKind = 'fave' | 'upvote' | 'downvote' | 'comments' | 'hide';

export function MediaBoxAction({
  kind,
  active = false,
  disabled = false,
  className,
  ...props
}: PropsOf<'a'> & { kind: MediaBoxActionKind; active?: boolean; disabled?: boolean }) {
  return (
    <a
      className={cn('media-box-action', kind, active && 'active', disabled && 'disabled', className)}
      aria-disabled={disabled || undefined}
      {...props}
    />
  );
}

export function MediaBoxScore({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('media-box-score', className)} {...props} />;
}

/** The square picture area holding an `img` or `video`. */
export function MediaBoxContent({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('media-box-content', className)} {...props} />;
}

/** A strip over the picture; `bottom` pins it to the bottom edge. */
export function MediaBoxOverlay({ bottom = false, className, ...props }: PropsOf<'div'> & { bottom?: boolean }) {
  return <div className={cn('media-box-overlay', bottom && 'bottom', className)} {...props} />;
}

/** Several overlay strips stacked. */
export function MediaBoxOverlays({ bottom = false, className, ...props }: PropsOf<'div'> & { bottom?: boolean }) {
  return <div className={cn('media-box-overlays', bottom && 'bottom', className)} {...props} />;
}

/** The cover shown over a spoilered picture. Removing it reveals the spoiler; that is your script's job. */
export function MediaBoxVeil({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('media-box-veil', className)} {...props} />;
}

/** Fills the row with `MediaBox`es of at least the thumbnail width. */
export function MediaList({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('media-list', className)} {...props} />;
}

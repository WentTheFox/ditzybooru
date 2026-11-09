import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** The tag categories the stylesheet has a color for, as `.tag-{category}`. */
export type TagCategory =
  | 'general'
  | 'rating'
  | 'spoiler'
  | 'origin'
  | 'oc'
  | 'error'
  | 'character'
  | 'content-official'
  | 'content-fanmade'
  | 'species'
  | 'body-type';

export function Tag({
  category,
  muted = false,
  className,
  ...props
}: PropsOf<'span'> & { category?: TagCategory; muted?: boolean }) {
  return (
    <span className={cn('tag', category !== undefined && `tag-${category}`, muted && 'muted', className)} {...props} />
  );
}

export function TagIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('tag-icon', className)} aria-hidden="true" {...props} />;
}

export function TagName({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('tag-name', className)} {...props} />;
}

export function TagCount({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('tag-count', className)} {...props} />;
}

export function TagRemove({ className, ...props }: PropsOf<'button'>) {
  return <button type="button" className={cn('tag-remove', className)} {...props} />;
}

export function TagList({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('tag-list', className)} {...props} />;
}

/** A tag input: `Tag`s and an `InputField` that grows as you type. Adding and removing is your script's job. */
export function TagBox({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('tag-box', className)} {...props} />;
}

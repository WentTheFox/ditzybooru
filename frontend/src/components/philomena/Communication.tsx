import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** A comment or post. Give it an `id` so `:target` highlights it when linked. */
export function Communication({ deleted = false, className, ...props }: PropsOf<'article'> & { deleted?: boolean }) {
  return <article className={cn('communication', deleted && 'deleted', className)} {...props} />;
}

/** The avatar and content row. */
export function CommunicationBody({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-body', className)} {...props} />;
}

export function CommunicationAvatar({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-avatar', className)} {...props} />;
}

export function CommunicationContent({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-content', className)} {...props} />;
}

/** The name and role badges. */
export function CommunicationAuthor({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-author', className)} {...props} />;
}

export function CommunicationAuthorName({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('communication-author-name', className)} {...props} />;
}

/** Make it a clamp (`clamp` after a `clamp-toggle`) to cut long text. */
export function CommunicationText({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-text', className)} {...props} />;
}

/** The row of links under the text; use two children for its two groups. */
export function CommunicationOptions({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-options', className)} {...props} />;
}

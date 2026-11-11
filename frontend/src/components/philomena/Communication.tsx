import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** A comment or post. Give it an `id` so `:target` highlights it when linked. */
export function Communication({ deleted = false, className, ...props }: PropsOf<'article'> & { deleted?: boolean }) {
  return <article className={cn('communication', deleted && 'deleted', className)} {...props} />;
}

/**
 * What the site says about a communication (why it was deleted, by whom), in a
 * bar before `CommunicationBody`. It sits outside the text so nothing a user
 * writes can look like it.
 */
export function CommunicationNotice({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('communication-notice', className)} {...props} />;
}

/** Who the notice comes from, at the end of its bar. */
export function CommunicationNoticeBy({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('communication-notice-by', className)} {...props} />;
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

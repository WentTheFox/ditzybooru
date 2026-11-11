import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/**
 * A textarea in one frame with a toolbar above it and an optional footer below,
 * for writing comments and posts. The stylesheet draws the parts; what the
 * buttons do is up to you. `invalid` marks the frame like an invalid field.
 */
export function Editor({ invalid = false, className, ...props }: PropsOf<'div'> & { invalid?: boolean }) {
  return <div className={cn('editor', invalid && 'invalid', className)} {...props} />;
}

/** The bar above the input; it wraps when it runs out of room. */
export function EditorToolbar({ className, ...props }: PropsOf<'div'>) {
  return <div role="toolbar" className={cn('editor-toolbar', className)} {...props} />;
}

/** Buttons divided from their neighbors by a line. */
export function EditorToolbarGroup({ className, ...props }: PropsOf<'div'>) {
  return <div role="group" className={cn('editor-toolbar-group', className)} {...props} />;
}

/** Pushes what follows it to the end of the bar. */
export function EditorToolbarSpacer({ className, ...props }: PropsOf<'span'>) {
  return <span aria-hidden="true" className={cn('editor-toolbar-spacer', className)} {...props} />;
}

/** `active` marks a button whose format is on. */
export function EditorButton({ active = false, className, ...props }: PropsOf<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn('editor-button', active && 'active', className)}
      {...props}
    />
  );
}

/** `mono` sets the text in the monospace font. */
export function EditorInput({ mono = false, className, ...props }: PropsOf<'textarea'> & { mono?: boolean }) {
  return <textarea className={cn('editor-input', mono && 'mono', className)} {...props} />;
}

export function EditorFooter({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('editor-footer', className)} {...props} />;
}

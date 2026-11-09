import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** The page content column and its container. A `div`: the page shell owns the one `main`. */
export function Content({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('content', className)} {...props} />;
}

export function ContentContainer({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('content-container', className)} {...props} />;
}

export function Blockquote({ className, ...props }: PropsOf<'blockquote'>) {
  return <blockquote className={cn('blockquote', className)} {...props} />;
}

/** `wrap` wraps long lines instead of scrolling. */
export function CodeBlock({ wrap = false, className, ...props }: PropsOf<'pre'> & { wrap?: boolean }) {
  return <pre className={cn('code-block', wrap && 'wrap', className)} {...props} />;
}

/** Inline code. `small` is a smaller size; `baseFont` uses the text font. */
export function CodeSpan({
  small = false,
  baseFont = false,
  className,
  ...props
}: PropsOf<'code'> & { small?: boolean; baseFont?: boolean }) {
  return <code className={cn('code-span', small && 'small', baseFont && 'base-font', className)} {...props} />;
}

/** Text blacked out until hovered or focused; `revealed` shows it for good. */
export function Spoiler({ revealed = false, className, ...props }: PropsOf<'span'> & { revealed?: boolean }) {
  // Focusable so keyboard users can reveal it, as the stylesheet's `:focus` rule expects.
  return <span tabIndex={0} className={cn('spoiler', revealed && 'revealed', className)} {...props} />;
}

/**
 * Text cut off after `--clamp-max-height`, with the rest behind a label, and no
 * script: the checkbox goes right before the text. `id` links the labels to it.
 * Leave it out for text you know is short.
 */
export function Clamp({
  id,
  moreLabel = 'Show more',
  lessLabel = 'Show less',
  className,
  children,
  ...props
}: PropsOf<'div'> & { id: string; moreLabel?: React.ReactNode; lessLabel?: React.ReactNode }) {
  return (
    <>
      <input
        type="checkbox"
        id={id}
        className="clamp-toggle"
        aria-label={typeof moreLabel === 'string' ? moreLabel : undefined}
      />
      <div className={cn('clamp', className)} {...props}>
        {children}
        <label className="clamp-more" htmlFor={id}>
          {moreLabel}
        </label>
        <label className="clamp-less" htmlFor={id}>
          {lessLabel}
        </label>
      </div>
    </>
  );
}

/** A box that animates between 0 and its content's height; your script sets `visible` and the height. */
export function Collapsible({
  visible = false,
  animate = false,
  className,
  ...props
}: PropsOf<'div'> & { visible?: boolean; animate?: boolean }) {
  return <div className={cn('collapsible', visible && 'visible', animate && 'animate', className)} {...props} />;
}

export function CollapsibleInner({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('collapsible-inner', className)} {...props} />;
}

/** A read-only value with an attached button, e.g. a copy action. */
export function CopyableText({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('copyable-text', className)} {...props} />;
}

export function CopyableTextData({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('copyable-text-data', className)} {...props} />;
}

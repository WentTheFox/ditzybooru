import type { ElementType, ReactNode } from 'react';

import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

type Justify = 'start' | 'center' | 'end';

interface ButtonOwnProps {
  type?: ColorType;
  pressed?: boolean;
  /** Draws the clock indicator over the content. Needs `LoadingIcon` as the first child (done for you here). */
  loading?: boolean;
  /** A square button holding one `ButtonIcon`. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  justify?: Justify;
  /** Wraps long labels instead of cutting them off with an ellipsis. */
  allowOverflow?: boolean;
  /** Matches the height of an adjacent `InputField` (inside a `FormInputGroup`). */
  sizeInput?: boolean;
  /** The size and shape of a `Badge`, for toolbars and list rows. */
  sizeBadge?: boolean;
  /** Makes a plain `<button>` submit its form. Without it a button never does by accident. */
  submit?: boolean;
}

/**
 * The classes of a button. For a router `Link` or an `a`, where `Button`'s `as`
 * cannot keep the route typed: `<Link className={buttonClass({ type: 'primary' })}>`.
 */
export function buttonClass({
  type,
  pressed,
  loading,
  iconOnly,
  fullWidth,
  justify,
  allowOverflow,
  sizeInput,
  sizeBadge,
}: ButtonOwnProps) {
  return cn(
    'button',
    colorClass('button', type),
    pressed && 'pressed',
    loading && 'loading',
    iconOnly && 'icon-only',
    fullWidth && 'full-width',
    justify !== undefined && `justify-${justify}`,
    allowOverflow && 'allow-overflow',
    sizeInput && 'button-size-input',
    sizeBadge && 'button-size-badge',
  );
}

/**
 * The animated clock drawn over a loading button. Marked `aria-hidden`: the
 * button itself carries the state through `aria-busy`.
 */
function LoadingIndicator({ className, ...props }: PropsOf<'svg'>) {
  return (
    <svg
      className={cn('loading-indicator', className)}
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <g className="base">
        <circle className="face" cx="32" cy="32" r="27" />
        <path className="ticking" d="M32 8v4M56 32h-4M32 56v-4M8 32h4" />
      </g>
      <path className="minute" d="M30.5 32V10a1.5 1.5 0 0 1 3 0v22z" />
      <path className="hour" d="M30.5 32V18a1.5 1.5 0 0 1 3 0v14z" />
    </svg>
  );
}

export function LoadingIcon({ className, ...props }: PropsOf<'span'>) {
  return (
    <span className={cn('loading-icon', className)} {...props}>
      <LoadingIndicator />
    </span>
  );
}

/** The inner wrapper `Button` renders; for a link built with `buttonClass`. */
export function ButtonContent({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('button-content', className)} {...props} />;
}

export function ButtonIcon({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('button-icon', className)} aria-hidden="true" {...props} />;
}

export function ButtonText({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('button-text', className)} {...props} />;
}

type ButtonProps<TElement extends ElementType> = ButtonOwnProps & {
  /** The element to render: a `button` by default, `a` for links, `label` for burger triggers. */
  as?: TElement;
  className?: PropsOf<'button'>['className'];
  children?: ReactNode;
} & Omit<React.ComponentProps<TElement>, keyof ButtonOwnProps | 'as' | 'className' | 'children'>;

/**
 * `.button > .button-content > (.button-icon, .button-text)`. Children go
 * inside `.button-content`; use `ButtonIcon` and `ButtonText` for the slots.
 */
export function Button<TElement extends ElementType = 'button'>({
  as,
  type,
  pressed,
  loading,
  iconOnly,
  fullWidth,
  justify,
  allowOverflow,
  sizeInput,
  sizeBadge,
  submit = false,
  className,
  children,
  ...props
}: ButtonProps<TElement>) {
  const Component: ElementType = as ?? 'button';
  const extra: { type?: string; 'aria-busy'?: boolean; 'aria-pressed'?: boolean } = {};
  if (Component === 'button') {
    extra.type = submit ? 'submit' : 'button';
  }
  if (loading) extra['aria-busy'] = true;
  if (pressed !== undefined) extra['aria-pressed'] = pressed;

  return (
    <Component
      className={cn(
        buttonClass({ type, pressed, loading, iconOnly, fullWidth, justify, allowOverflow, sizeInput, sizeBadge }),
        className,
      )}
      {...extra}
      {...props}
    >
      {loading && <LoadingIcon />}
      <ButtonContent>{children}</ButtonContent>
    </Component>
  );
}

/** Buttons joined into one control; `separated` keeps a gap between them. */
export function ButtonGroup({
  separated = false,
  sizeBadge = false,
  className,
  ...props
}: PropsOf<'div'> & { separated?: boolean; sizeBadge?: boolean }) {
  return (
    <div
      role="group"
      className={cn('button-group', separated && 'separated', sizeBadge && 'button-size-badge', className)}
      {...props}
    />
  );
}

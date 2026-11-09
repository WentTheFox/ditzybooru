import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** A flex row with the stylesheet's helpers. */
export function Flex({
  column = false,
  wrap = false,
  gap,
  justify,
  center = false,
  middle = false,
  grow = false,
  className,
  ...props
}: PropsOf<'div'> & {
  column?: boolean;
  wrap?: boolean;
  gap?: Gap;
  /** Main-axis alignment: `flex-between` or `flex-end`. */
  justify?: 'between' | 'end';
  /** Centers the items on the cross axis (`flex-center`). */
  center?: boolean;
  /** Centers the items on both axes (`flex-middle`). */
  middle?: boolean;
  grow?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex',
        column && 'flex-column',
        wrap && 'flex-wrap',
        gap !== undefined && `gap-${gap}`,
        justify !== undefined && `flex-${justify}`,
        center && 'flex-center',
        middle && 'flex-middle',
        grow && 'flex-grow',
        className,
      )}
      {...props}
    />
  );
}

/** A sidebar and main column pair: `LayoutColumns` > `LayoutSide` + `LayoutMain`. */
export function LayoutColumns({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('layout-columns', className)} {...props} />;
}

export function LayoutSide({ className, ...props }: PropsOf<'aside'>) {
  return <aside className={cn('layout-side', className)} {...props} />;
}

export function LayoutMain({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('layout-main', className)} {...props} />;
}

/** A narrow, optionally centered, page column. */
export function LayoutNarrow({ center = false, className, ...props }: PropsOf<'div'> & { center?: boolean }) {
  return <div className={cn('layout-narrow', center && 'layout-center', className)} {...props} />;
}

/** A wrapping grid whose items share a basis (`15`, `20`, `30`, `40`, or `auto`). */
export function GridFlex({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('grid-flex', className)} {...props} />;
}

export function GridFlexItem({ basis, className, ...props }: PropsOf<'div'> & { basis?: 15 | 20 | 30 | 40 | 'auto' }) {
  return <div className={cn('grid-flex-item', basis !== undefined && `flex-basis-${basis}`, className)} {...props} />;
}

/** Hides its content: always, below a breakpoint, from a breakpoint up, or in print. */
export function Hidden({
  below,
  from,
  print = false,
  className,
  ...props
}: PropsOf<'span'> & { below?: Breakpoint; from?: Breakpoint; print?: boolean }) {
  const always = below === undefined && from === undefined && !print;
  return (
    <span
      className={cn(
        always && 'hidden',
        below !== undefined && `hidden-below-${below}`,
        from !== undefined && `hidden-from-${from}`,
        print && 'hidden-print',
        className,
      )}
      {...props}
    />
  );
}

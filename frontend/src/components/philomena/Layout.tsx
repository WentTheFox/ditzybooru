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
  /** Centers the items on the cross axis (`items-center`). */
  center?: boolean;
  /** Centers the items on both axes (`items-center justify-center`). */
  middle?: boolean;
  grow?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex',
        column && 'flex-col',
        wrap && 'flex-wrap',
        gap !== undefined && `gap-${gap}`,
        justify !== undefined && `flex-${justify}`,
        center && 'items-center',
        middle && 'items-center justify-center',
        grow && 'flex-1',
        className,
      )}
      {...props}
    />
  );
}

type Columns = 1 | 2 | 3 | 4 | 5 | 6 | 12;

/** A CSS grid of `columns` equal columns (`gap` is a step of the spacing scale). */
export function Grid({ columns, gap, className, ...props }: PropsOf<'div'> & { columns?: Columns; gap?: Gap }) {
  return (
    <div
      className={cn(
        'grid',
        columns !== undefined && `grid-cols-${columns}`,
        gap !== undefined && `gap-${gap}`,
        className,
      )}
      {...props}
    />
  );
}

/** A grid item that spans `span` columns (`full` for all of them). */
export function GridItem({ span, className, ...props }: PropsOf<'div'> & { span: Columns | 'full' }) {
  return <div className={cn(`col-span-${span}`, className)} {...props} />;
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

import { cn } from '#/lib/utils';

import { colorClass } from './props';
import type { ColorType, PropsOf } from './props';

/** A framed container with a heading band. `type` tints it. */
export function Card({ type, className, ...props }: PropsOf<'div'> & { type?: ColorType }) {
  return <div className={cn('card', colorClass('card', type), className)} {...props} />;
}

export function CardHeader({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('card-header', className)} {...props} />;
}

/** The sibling of a card with a bar instead of a heading band. */
export function Block({ type, className, ...props }: PropsOf<'section'> & { type?: ColorType }) {
  return <section className={cn('block', colorClass('block', type), className)} {...props} />;
}

/** `sub` is a lighter bar for a section inside a block. */
export function BlockHeader({ sub = false, className, ...props }: PropsOf<'div'> & { sub?: boolean }) {
  return <div className={cn('block-header', sub && 'sub', className)} {...props} />;
}

export function BlockHeaderActions({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('block-header-actions', className)} {...props} />;
}

export function BlockContent({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('block-content', className)} {...props} />;
}

/** A card-sized form layout and its sections. */
export function CardForms({ className, ...props }: PropsOf<'form'>) {
  return <form className={cn('card-forms', className)} {...props} />;
}

export function CardFormsSection({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('card-forms-section', className)} {...props} />;
}

export function Accordion({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('accordion', className)} {...props} />;
}

/** A script-free item: a `details` with a `summary` header. Pass `open` to start expanded. */
export function AccordionItem({
  header,
  className,
  children,
  ...props
}: PropsOf<'details'> & { header: React.ReactNode }) {
  return (
    <details className={cn('accordion-item', className)} {...props}>
      <summary className="accordion-item-header">{header}</summary>
      <div className="accordion-item-body">{children}</div>
    </details>
  );
}

export function tabClass(selected = false): string {
  return cn('tab', selected && 'selected');
}

/** A bar of links to other pages, each page marking its own tab `selected` (see `tabClass`). */
export function TabsNav({ className, ...props }: PropsOf<'nav'>) {
  return <nav className={cn('tabs', className)} {...props} />;
}

/** Tab links, each followed elsewhere by a `TabPanel`. Your script moves `selected`. */
export function Tabs({ className, ...props }: PropsOf<'div'>) {
  return <div role="tablist" className={cn('tabs', className)} {...props} />;
}

export function Tab({
  selected = false,
  disabled = false,
  className,
  ...props
}: PropsOf<'button'> & { selected?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      className={cn('tab', selected && 'selected', disabled && 'disabled', className)}
      {...props}
    />
  );
}

export function TabPanel({ selected = false, className, ...props }: PropsOf<'div'> & { selected?: boolean }) {
  return <div role="tabpanel" className={cn('tab-panel', selected && 'selected', className)} {...props} />;
}

/** A heading between groups of tabs, inside `Tabs` (most useful in `SideTabs`). */
export function TabsTitle({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('tabs-title', className)} {...props} />;
}

/**
 * Tabs in a column at the start with the panel next to it, for settings pages.
 * Children are the `Tabs` bar and the `TabPanel`s. Give `toggleId` to make the
 * bar a selector on narrow screens that opens on click, without a script; put
 * a `SideTabsExpand` with the same id first inside the bar.
 */
export function SideTabs({ toggleId, className, children, ...props }: PropsOf<'div'> & { toggleId?: string }) {
  return (
    <div className={cn('side-tabs', className)} {...props}>
      {toggleId === undefined ? null : (
        <input type="checkbox" id={toggleId} className="side-tabs-toggle" aria-label="Show all sections" />
      )}
      {children}
    </div>
  );
}

/** The label that opens a narrow `SideTabs` bar; the first child of `Tabs`. */
export function SideTabsExpand({
  toggleId,
  className,
  ...props
}: Omit<PropsOf<'label'>, 'htmlFor'> & { toggleId: string }) {
  return <label htmlFor={toggleId} className={cn('side-tabs-expand', className)} {...props} />;
}

/** A floating panel. `visible` shows it; `wide` and `allowOverflow` change its box. */
export function Popup({
  visible = false,
  wide = false,
  allowOverflow = false,
  hasAnchor = false,
  className,
  ...props
}: PropsOf<'dialog'> & { visible?: boolean; wide?: boolean; allowOverflow?: boolean; hasAnchor?: boolean }) {
  return (
    <dialog
      className={cn(
        'popup',
        visible && 'visible',
        wide && 'wide',
        allowOverflow && 'allow-overflow',
        hasAnchor && 'has-anchor',
        className,
      )}
      {...props}
    />
  );
}

/** `value` is 0-100; the width of the bar is set for you. */
export function Progress({
  type,
  value,
  className,
  ...props
}: Omit<PropsOf<'div'>, 'children'> & { type?: ColorType; value: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn('progress', colorClass('progress', type), className)}
      {...props}
    >
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Separator({
  thin = false,
  vertical = false,
  className,
  ...props
}: PropsOf<'hr'> & { thin?: boolean; vertical?: boolean }) {
  return <hr className={cn('separator', thin && 'thin', vertical && 'vertical', className)} {...props} />;
}

/** Wraps a `Table`; `responsive` scrolls it sideways on narrow screens. */
export function TableWrap({ responsive = false, className, ...props }: PropsOf<'div'> & { responsive?: boolean }) {
  return <div className={cn('table-wrap', responsive && 'responsive', className)} {...props} />;
}

/** Tint a row or cell by giving it the class `table-{type}`. */
export function Table({
  striped = false,
  hover = false,
  type,
  className,
  ...props
}: PropsOf<'table'> & { striped?: boolean; hover?: boolean; type?: ColorType }) {
  return (
    <table
      className={cn('table', colorClass('table', type), striped && 'striped', hover && 'hover', className)}
      {...props}
    />
  );
}

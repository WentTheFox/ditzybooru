import type { ReactNode } from 'react';

import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

/** A row of related controls; `vertical` stacks them. */
export function FormControlGroup({ vertical = false, className, ...props }: PropsOf<'div'> & { vertical?: boolean }) {
  return <div className={cn('form-control-group', vertical && 'vertical', className)} {...props} />;
}

/** Wraps one control. `disabled` fades it; `fullWidth` stretches it. */
export function FormControlWrap({
  disabled = false,
  fullWidth = false,
  className,
  ...props
}: PropsOf<'div'> & { disabled?: boolean; fullWidth?: boolean }) {
  return (
    <div className={cn('form-control-wrap', disabled && 'disabled', fullWidth && 'full-width', className)} {...props} />
  );
}

export function FormControl({ buttons = false, className, ...props }: PropsOf<'div'> & { buttons?: boolean }) {
  return <div className={cn('form-control', buttons && 'form-control-buttons', className)} {...props} />;
}

/** A text input. `invalid` marks it from your script or server; the browser's own invalid state shows after editing. */
export function InputField({
  fullWidth = false,
  invalid = false,
  className,
  ...props
}: PropsOf<'input'> & { fullWidth?: boolean; invalid?: boolean }) {
  return (
    <input
      className={cn('input-field', fullWidth && 'full-width', invalid && 'invalid', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** A multi-line `input-field`. */
export function TextAreaField({
  fullWidth = false,
  invalid = false,
  className,
  ...props
}: PropsOf<'textarea'> & { fullWidth?: boolean; invalid?: boolean }) {
  return (
    <textarea
      className={cn('input-field', fullWidth && 'full-width', invalid && 'invalid', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** An input with attached controls (a `Button` with `sizeInput`, or a symbol). */
export function FormInputGroup({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('form-input-group', className)} {...props} />;
}

export function FormInputGroupSymbol({ className, children, ...props }: PropsOf<'span'>) {
  return (
    <span className={cn('form-input-group-symbol-wrap', className)} {...props}>
      <span className="form-input-group-symbol">
        <span className="form-input-group-symbol-inner">{children}</span>
      </span>
    </span>
  );
}

/** A checkbox with its label. `icon` is the check glyph (an inline SVG of about 1.25em by 1em). */
export function Checkbox({
  label,
  icon,
  className,
  ...props
}: PropsOf<'input'> & { label: ReactNode; icon?: ReactNode }) {
  return (
    <label className={cn('form-control-checkbox', className)}>
      <span className="form-checkbox-input-wrap">
        <input type="checkbox" className="form-checkbox-input" {...props} />
        <span className="form-checkbox-check-icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="form-checkbox-label">{label}</span>
    </label>
  );
}

/** A radio button with its label. `icon` is the selected-state glyph. */
export function Radio({ label, icon, className, ...props }: PropsOf<'input'> & { label: ReactNode; icon?: ReactNode }) {
  return (
    <label className={cn('form-control-radio', className)}>
      <span className="form-radio-input-wrap">
        <input type="radio" className="form-radio-input" {...props} />
        <span className="form-radio-select-icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="form-radio-label">{label}</span>
    </label>
  );
}

/** A checkbox drawn as a sliding toggle. Needs no icon. */
export function FormSwitch({ label, className, ...props }: PropsOf<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('form-control-switch', className)}>
      <input type="checkbox" role="switch" className="form-switch-input" {...props} />
      <span className="form-switch-label">{label}</span>
    </label>
  );
}

/** A native `select`. `icon` is the chevron slot. */
export function Select({
  fullWidth = false,
  icon,
  className,
  children,
  ...props
}: PropsOf<'select'> & { fullWidth?: boolean; icon?: ReactNode }) {
  return (
    <span className={cn('form-control-select', fullWidth && 'full-width')}>
      <select className={cn('form-select-input', className)} {...props}>
        {children}
      </select>
      <span className="form-select-icon" aria-hidden="true">
        {icon}
      </span>
    </span>
  );
}

/** Help, error or success text under a control. */
export function FormMessage({
  kind = 'description',
  className,
  ...props
}: PropsOf<'div'> & { kind?: 'description' | 'error' | 'success' }) {
  return (
    <div
      className={cn('form-message', `form-message-${kind}`, className)}
      role={kind === 'error' ? 'alert' : undefined}
      {...props}
    />
  );
}

/** Wraps the submit button(s) of a form. */
export function FormControlSubmit({ className, ...props }: PropsOf<'div'>) {
  return <div className={cn('form-control-submit', className)} {...props} />;
}

/** A range input. Set `fill` (0-100) for the filled track outside Firefox. */
export function Slider({
  fullWidth = false,
  fill,
  className,
  style,
  ...props
}: PropsOf<'input'> & { fullWidth?: boolean; fill?: number }) {
  return (
    <input
      type="range"
      className={cn('slider', fullWidth && 'full-width', className)}
      style={fill === undefined ? style : ({ '--slider-fill': `${fill}%`, ...style } as React.CSSProperties)}
      {...props}
    />
  );
}

/**
 * The styled suggestion list of a combobox. It is styling only: your script
 * filters, handles the keyboard and sets `selected` / `highlighted` on items.
 */
export function ComboboxSuggestions({ className, ...props }: PropsOf<'ul'>) {
  return <ul role="listbox" className={cn('combobox-suggestions', className)} {...props} />;
}

export function ComboboxSuggestionHeader({
  overlay = false,
  className,
  ...props
}: PropsOf<'li'> & { overlay?: boolean }) {
  return (
    <li
      role="presentation"
      className={cn('combobox-suggestion-header', overlay && 'combobox-suggestion-header-overlay', className)}
      {...props}
    />
  );
}

export function ComboboxSuggestionItem({
  selected = false,
  highlighted = false,
  addon,
  className,
  children,
  ...props
}: Omit<PropsOf<'li'>, 'children'> & {
  selected?: boolean;
  highlighted?: boolean;
  addon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li
      role="option"
      aria-selected={selected}
      className={cn('combobox-suggestion-item', selected && 'selected', highlighted && 'highlighted', className)}
      {...props}
    >
      <span className="combobox-suggestion-item-label">
        <span className="combobox-suggestion-item-text">
          <span className="combobox-suggestion-item-main-text">{children}</span>
        </span>
        {addon !== undefined && <span className="combobox-suggestion-item-addon">{addon}</span>}
      </span>
    </li>
  );
}

/** A switch for a `DropdownItem` / `NavbarMenuItem` label (`as="label"`). */
export function MenuSwitch({ end = false, className, ...props }: Omit<PropsOf<'input'>, 'type'> & { end?: boolean }) {
  return (
    <input type="checkbox" role="switch" className={cn('form-switch-input', end && 'menu-end', className)} {...props} />
  );
}

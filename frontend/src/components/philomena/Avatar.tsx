import { cn } from '#/lib/utils';

import type { PropsOf } from './props';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * A round (or `square`) user picture: 28, 50, 100 or 125px. Renders an `img`
 * when given a `src`, otherwise a box for `children` such as initials.
 */
export function Avatar({
  size,
  square = false,
  src,
  alt = '',
  className,
  children,
  ...props
}: Omit<PropsOf<'span'>, 'children'> & {
  size?: AvatarSize;
  square?: boolean;
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}) {
  const classes = cn('avatar', size !== undefined && `avatar-${size}`, square && 'square', className);
  if (src !== undefined) {
    return (
      <span className={classes} {...props}>
        <img src={src} alt={alt} />
      </span>
    );
  }
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export function AvatarGroup({ className, ...props }: PropsOf<'span'>) {
  return <span className={cn('avatar-group', className)} {...props} />;
}

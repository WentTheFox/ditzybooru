import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

import { NavbarDropdown, NavbarMenu } from '#/components/philomena/Navbar';

/**
 * A navbar menu that opens on hover and focus, and closes when a link in it is
 * followed.
 *
 * Following a link navigates without moving the pointer or the focus, so the
 * stylesheet's hover/focus-within rule alone would leave the menu open over the
 * new page. `data-dismissed` hides it (see `NavDropdown.css`). It is released on
 * the way back in, never on the way out: hiding the menu pulls it from under
 * the cursor, so releasing on leave would flash it open again.
 */
export function NavDropdown({
  trigger,
  end = false,
  pinned = false,
  children,
}: {
  /** The `NavbarItem` the menu hangs off. */
  trigger: ReactNode;
  end?: boolean;
  pinned?: boolean;
  children: ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      setDismissed(true);
    }
  };
  const release = () => {
    setDismissed(false);
  };

  return (
    <NavbarDropdown
      pinned={pinned}
      data-dismissed={dismissed ? '' : undefined}
      onClick={handleClick}
      onPointerEnter={release}
      onFocus={release}
    >
      {trigger}
      <NavbarMenu end={end}>{children}</NavbarMenu>
    </NavbarDropdown>
  );
}

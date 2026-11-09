import type { ReactNode, Ref } from 'react';
import { Link } from '@tanstack/react-router';

import { Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';

interface SidebarBlockProps {
  title: string;
  /** Makes the header title a link to this destination. */
  href?: string;
  icon?: ReactNode;
  /** Optional link rendered at the bottom of the block. */
  footer?: { label: string; href: string };
  /** The block itself, for the in-view observers of the lazy blocks. */
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * A titled sidebar block: a `Block` with a title bar, a body and an optional
 * footer link. It exists to keep the sidebar's blocks from restating the same
 * header/footer shape.
 */
export function SidebarBlock({ title, href, icon, footer, ref, children }: SidebarBlockProps) {
  const heading = (
    <span className="flex flex-center gap-sm">
      {icon}
      {title}
    </span>
  );

  return (
    <Block ref={ref}>
      <BlockHeader>{href === undefined ? heading : <Link to={href}>{heading}</Link>}</BlockHeader>

      <BlockContent>{children}</BlockContent>

      {footer ? (
        <BlockHeader sub>
          <Link to={footer.href}>{footer.label}</Link>
        </BlockHeader>
      ) : null}
    </Block>
  );
}

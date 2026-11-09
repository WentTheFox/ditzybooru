import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@tanstack/react-router';
import { Heart, LogIn, Mail, Upload, UserPlus, UserRound, X } from 'lucide-react';

import { Counter } from '#/components/philomena/Badge';
import {
  Burger,
  BurgerDivider,
  BurgerHeader,
  BurgerIcon,
  BurgerOverlay,
  burgerCloseClass,
  burgerItemClass,
} from '#/components/philomena/Burger';
import { HeaderBrandText, headerBrandClass } from '#/components/philomena/Header';
import { useCurrentUser } from '#/hooks/use-current-user';
import { useDataSource } from '#/hooks/use-data-source';
import { useSignOut } from '#/hooks/use-session';
import { useSite } from '#/hooks/use-site';
import { primaryNav } from '#/lib/mock/site';
import { cn } from '#/lib/utils';
import { BrandMark } from './BrandMark';
import { ThemeToggleBurgerItem } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';

const accountLinks: Array<{ label: string; href: string }> = [
  { label: 'Watched', href: '/search?q=my:watched' },
  { label: 'Faves', href: '/search?q=my:faves' },
  { label: 'Upvotes', href: '/search?q=my:upvotes' },
  { label: 'Galleries', href: '/galleries' },
  { label: 'Uploads', href: '/search?q=my:uploads' },
  { label: 'Comments', href: '/comments?cq=my:comments' },
  { label: 'Settings', href: '/settings/edit' },
  { label: 'Logout', href: '/sessions' },
];

/**
 * Slide-in navigation panel for small screens, opened by the header's burger
 * item. The package's burger is script-free through a checkbox, but a checked
 * box would survive a client-side navigation and leave the panel open over the
 * new page, so this one is driven by `open` and closes on every link.
 *
 * The package leaves Escape, focus and scroll locking to a script; those are
 * done here.
 */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const user = useCurrentUser();
  const kind = useDataSource();
  const signOut = useSignOut();
  const site = useSite();

  const overlay = (
    <>
      <Burger open role="dialog" aria-modal="true" aria-label="Navigation menu">
        <BurgerHeader>
          <span className={headerBrandClass()}>
            <BrandMark />
            <HeaderBrandText>{site.name}</HeaderBrandText>
          </span>
          <button ref={closeRef} type="button" className={burgerCloseClass()} aria-label="Close menu" onClick={onClose}>
            <X size={18} />
          </button>
        </BurgerHeader>

        <Link
          // @ts-expect-error TODO: route not built yet
          to="/images/new"
          className={burgerItemClass()}
          onClick={onClose}
        >
          <BurgerIcon>
            <Upload size={16} />
          </BurgerIcon>
          Upload
        </Link>
        <Link
          // @ts-expect-error TODO: route not built yet
          to="/pages/donations"
          className={burgerItemClass()}
          onClick={onClose}
        >
          <BurgerIcon>
            <Heart size={16} />
          </BurgerIcon>
          Donate
        </Link>
        <Link
          // @ts-expect-error TODO: route not built yet
          to="/pages/contact"
          className={burgerItemClass()}
          onClick={onClose}
        >
          <BurgerIcon>
            <Mail size={16} />
          </BurgerIcon>
          Contact
        </Link>

        <BurgerDivider />

        {primaryNav.map(item => (
          <div key={item.href}>
            <Link to={item.href} className={burgerItemClass()} onClick={onClose}>
              <BurgerIcon>
                <item.icon size={16} />
              </BurgerIcon>
              {item.label}
              {item.counter === undefined ? null : <Counter subtle>{item.counter}</Counter>}
            </Link>
            {item.children?.map(child => (
              <Link key={child.href} to={child.href} className={cn(burgerItemClass(), 'ms-xl')} onClick={onClose}>
                <BurgerIcon />
                {child.label}
              </Link>
            ))}
          </div>
        ))}

        <BurgerDivider />

        {user ? (
          kind === 'live' ? (
            <>
              <span className={burgerItemClass()}>
                <BurgerIcon>
                  <UserAvatar name={user.name} src={user.avatarUrl} />
                </BurgerIcon>
                {user.name}
              </span>
              <Link to="/settings/account" className={burgerItemClass()} onClick={onClose}>
                <BurgerIcon>
                  <UserRound size={16} />
                </BurgerIcon>
                Account
              </Link>
              <button
                type="button"
                className={burgerItemClass()}
                onClick={() => {
                  signOut();
                  onClose();
                }}
              >
                <BurgerIcon />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/profiles/$slug" params={{ slug: user.slug }} className={burgerItemClass()} onClick={onClose}>
                <BurgerIcon>
                  <UserAvatar name={user.name} src={user.avatarUrl} />
                </BurgerIcon>
                {user.name}
              </Link>
              {accountLinks.map(link => (
                <Link key={link.href} to={link.href} className={cn(burgerItemClass(), 'ms-xl')} onClick={onClose}>
                  <BurgerIcon />
                  {link.label}
                </Link>
              ))}
            </>
          )
        ) : (
          <>
            <Link
              // @ts-expect-error TODO: route not built yet
              to="/registrations/new"
              className={burgerItemClass()}
              onClick={onClose}
            >
              <BurgerIcon>
                <UserPlus size={16} />
              </BurgerIcon>
              Register
            </Link>
            <Link to="/sessions/new" className={burgerItemClass()} onClick={onClose}>
              <BurgerIcon>
                <LogIn size={16} />
              </BurgerIcon>
              Login
            </Link>
          </>
        )}

        <BurgerDivider />

        <ThemeToggleBurgerItem />
      </Burger>
      <BurgerOverlay open aria-hidden="true" onClick={onClose} />
    </>
  );

  // Portal to <body> so the panel escapes the header's stacking context -
  // otherwise its fixed positioning would sit below the page content.
  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body);
}

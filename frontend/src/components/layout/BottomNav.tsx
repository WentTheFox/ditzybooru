import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell, Mail, Search, X } from 'lucide-react';

import { Counter, CounterAnchor } from '#/components/philomena/Badge';
import { navLinkClass } from '#/components/philomena/Header';
import { cn } from '#/lib/utils';
import { useCurrentUser } from '#/hooks/use-current-user';
import { SearchBar } from './SearchBar';

/**
 * The phone-sized navigation bar, pinned to the bottom of the viewport. It
 * carries the three destinations that are worth a thumb - search,
 * notifications, conversations - which the top bar gives up at this width.
 *
 * Search is a sheet rather than a link: the field it opens is the same one the
 * header renders on a wide screen, so searching stays a thing you do in place
 * rather than a page you navigate to.
 */
export function BottomNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [searchOpen]);

  const user = useCurrentUser();

  return (
    <nav className="bottom-nav hidden-from-md" aria-label="Primary">
      {searchOpen ? (
        <div className="p-md">
          <SearchBar inputRef={inputRef} />
        </div>
      ) : null}

      <div className="bottom-nav-bar nav horizontal">
        <button
          type="button"
          className={cn(navLinkClass(), 'flex flex-col items-center justify-center gap-xs')}
          aria-expanded={searchOpen}
          onClick={() => {
            setSearchOpen(open => !open);
          }}
        >
          {searchOpen ? <X size={20} /> : <Search size={20} />}
          {searchOpen ? 'Close' : 'Search'}
        </button>

        {user ? (
          <>
            <Link
              // @ts-expect-error TODO: route not built yet
              to="/notifications"
              className={cn(navLinkClass(), 'flex flex-col items-center justify-center gap-xs')}
            >
              <CounterAnchor>
                <Bell size={20} />
                <Counter type="danger" corner>
                  3
                </Counter>
              </CounterAnchor>
              Notifications
            </Link>
            <Link
              // @ts-expect-error TODO: route not built yet
              to="/conversations"
              className={cn(navLinkClass(), 'flex flex-col items-center justify-center gap-xs')}
            >
              <Mail size={20} />
              Conversations
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}

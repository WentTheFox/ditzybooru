import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell, Filter, Mail, Menu as MenuIcon, Upload } from 'lucide-react';

import { Counter, CounterAnchor } from '#/components/philomena/Badge';
import { Header, HeaderBrandText, headerBrandClass } from '#/components/philomena/Header';
import {
  Navbar,
  NavbarIcon,
  NavbarItem,
  NavbarMenuIcon,
  NavbarMenuItem,
  NavbarMenuText,
} from '#/components/philomena/Navbar';
import { cn } from '#/lib/utils';
import { useCurrentUser } from '#/hooks/use-current-user';
import { useDataSource } from '#/hooks/use-data-source';
import { useSignOut } from '#/hooks/use-session';
import { useSite } from '#/hooks/use-site';
import { BrandMark } from './BrandMark';
import { HeaderNav } from './HeaderNav';
import { MobileMenu } from './MobileMenu';
import { NavDropdown } from './NavDropdown';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';

const userMenuLinks: Array<{ label: string; href: string }> = [
  { label: 'Watched', href: '/search?q=my:watched' },
  { label: 'Faves', href: '/search?q=my:faves' },
  { label: 'Upvotes', href: '/search?q=my:upvotes' },
  { label: 'Galleries', href: '/galleries' },
  { label: 'Uploads', href: '/search?q=my:uploads' },
  { label: 'Comments', href: '/comments?cq=my:comments' },
  { label: 'Settings', href: '/settings/edit' },
  { label: 'Logout', href: '/sessions' },
];

function UserMenuTrigger({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <NavbarItem as="button" type="button" caret aria-haspopup="true" aria-label="User menu">
      <UserAvatar name={name} src={avatarUrl} />
    </NavbarItem>
  );
}

/**
 * The menu of a visitor signed in on a live site. Only what is built: the
 * rest of the mock menu points at pages that do not exist yet.
 */
function LiveUserMenu({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const signOut = useSignOut();

  return (
    <NavDropdown pinned end trigger={<UserMenuTrigger name={name} avatarUrl={avatarUrl} />}>
      <NavbarMenuItem as="span">
        <NavbarMenuIcon />
        <NavbarMenuText>
          <strong>{name}</strong>
        </NavbarMenuText>
      </NavbarMenuItem>
      <NavbarMenuItem as={Link} to="/settings/account">
        <NavbarMenuIcon />
        <NavbarMenuText>Account</NavbarMenuText>
      </NavbarMenuItem>
      <NavbarMenuItem as="button" type="button" onClick={signOut}>
        <NavbarMenuIcon />
        <NavbarMenuText>Sign out</NavbarMenuText>
      </NavbarMenuItem>
    </NavDropdown>
  );
}

function UserMenu() {
  const user = useCurrentUser();
  const kind = useDataSource();

  if (!user) {
    return (
      <>
        <NavbarItem as={Link} to="/registrations/new">
          Register
        </NavbarItem>
        <NavbarItem as={Link} to="/sessions/new" pinned>
          Login
        </NavbarItem>
      </>
    );
  }

  if (kind === 'live') {
    return <LiveUserMenu name={user.name} avatarUrl={user.avatarUrl} />;
  }

  return (
    <>
      <NavbarItem as={Link} to="/notifications" title="Notifications" aria-label="Notifications, 3 new">
        <CounterAnchor>
          <NavbarIcon>
            <Bell size={16} />
          </NavbarIcon>
          <Counter type="danger" corner>
            3
          </Counter>
        </CounterAnchor>
      </NavbarItem>
      <NavbarItem as={Link} to="/conversations" title="Conversations" aria-label="Conversations">
        <NavbarIcon>
          <Mail size={16} />
        </NavbarIcon>
      </NavbarItem>
      <NavbarItem as={Link} to="/filters" pinned title="Filters" aria-label="Filters">
        <NavbarIcon>
          <Filter size={16} />
        </NavbarIcon>
      </NavbarItem>

      <NavDropdown pinned end trigger={<UserMenuTrigger name={user.name} avatarUrl={user.avatarUrl} />}>
        <NavbarMenuItem as={Link} to={`/profiles/${user.slug}`}>
          <NavbarMenuIcon />
          <NavbarMenuText>
            <strong>{user.name}</strong>
          </NavbarMenuText>
        </NavbarMenuItem>
        {userMenuLinks.map(link => (
          <NavbarMenuItem key={link.href} as={Link} to={link.href}>
            <NavbarMenuIcon />
            <NavbarMenuText>{link.label}</NavbarMenuText>
          </NavbarMenuItem>
        ))}
      </NavDropdown>
    </>
  );
}

/** The sticky application header (brand, search, account) and the sections bar under it. */
export function SiteHeader() {
  const site = useSite();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Named so the view transition between pages can keep the bar above the
          morphing grid; see `styles/view-transitions.css`. */}
      <Header style={{ viewTransitionName: 'site-header' }}>
        {/* A navbar so the burger fills the header's height; the brand is pinned
            so it, like the burger, survives below the `md` breakpoint where the
            package folds every other navbar child away. */}
        <Navbar className="gap-sm" aria-label="Site">
          <NavbarItem
            as="button"
            type="button"
            className="navbar-burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(true);
            }}
          >
            <NavbarIcon>
              <MenuIcon size={18} />
            </NavbarIcon>
          </NavbarItem>

          <Link to="/" className={cn(headerBrandClass(), 'navbar-pinned')} aria-label={`${site.name} home`}>
            <BrandMark />
            <HeaderBrandText>{site.name}</HeaderBrandText>
          </Link>
        </Navbar>

        <SearchBar className="flex-1 hidden-below-md mx-xl" />

        <Navbar className="flex-none" aria-label="Account and tools">
          <NavbarItem as={Link} to="/images/new" title="Upload" aria-label="Upload">
            <NavbarIcon>
              <Upload size={16} />
            </NavbarIcon>
          </NavbarItem>
          <ThemeToggle />
          <UserMenu />
        </Navbar>
      </Header>

      <HeaderNav />

      {menuOpen ? (
        <MobileMenu
          onClose={() => {
            setMenuOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

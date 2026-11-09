import { Link } from '@tanstack/react-router';
import { Heart, Mail } from 'lucide-react';

import { Counter } from '#/components/philomena/Badge';
import {
  Navbar,
  NavbarIcon,
  NavbarItem,
  NavbarMenuIcon,
  NavbarMenuItem,
  NavbarMenuText,
} from '#/components/philomena/Navbar';
import { primaryNav } from '#/lib/mock/site';
import type { NavItem } from '#/lib/mock/site';
import { NavDropdown } from './NavDropdown';

function NavEntry({ item }: { item: NavItem }) {
  const children = item.children ?? [];
  const Icon = item.icon;

  const link = (
    <NavbarItem as={Link} to={item.href} caret={children.length > 0}>
      <NavbarIcon>
        <Icon size={14} />
      </NavbarIcon>
      {item.label}
      {item.counter === undefined ? null : <Counter subtle>{item.counter}</Counter>}
    </NavbarItem>
  );

  if (children.length === 0) {
    return link;
  }

  return (
    <NavDropdown trigger={link}>
      {children.map(child => (
        <NavbarMenuItem key={child.href} as={Link} to={child.href}>
          <NavbarMenuIcon />
          <NavbarMenuText>{child.label}</NavbarMenuText>
        </NavbarMenuItem>
      ))}
    </NavDropdown>
  );
}

/**
 * The secondary navigation bar: the sections (Forums / Comments / Galleries /
 * ...) followed by Donate and Contact. Hidden on small screens, where its
 * contents live in the burger menu instead.
 */
export function HeaderNav() {
  return (
    <Navbar className="hidden-below-md" aria-label="Sections">
      {primaryNav.map(item => (
        <NavEntry key={item.href} item={item} />
      ))}

      <NavbarItem as={Link} to="/pages/donations" title="Become a patron or donate">
        <NavbarIcon>
          <Heart size={14} />
        </NavbarIcon>
        Donate
      </NavbarItem>
      <NavbarItem as={Link} to="/pages/contact" title="Contact us">
        <NavbarIcon>
          <Mail size={14} />
        </NavbarIcon>
        Contact
      </NavbarItem>
    </Navbar>
  );
}

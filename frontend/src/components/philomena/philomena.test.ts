import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import * as Alert from './Alert';
import * as Avatar from './Avatar';
import * as Badge from './Badge';
import * as Burger from './Burger';
import * as Button from './Button';
import * as Communication from './Communication';
import * as Content from './Content';
import * as Dropdown from './Dropdown';
import * as Forms from './Forms';
import * as Header from './Header';
import * as Layout from './Layout';
import * as MediaBox from './MediaBox';
import * as Navbar from './Navbar';
import * as Pagination from './Pagination';
import * as Surfaces from './Surfaces';
import * as Tag from './Tag';

/**
 * Every class a component can emit must exist in the package stylesheet. A typo
 * or a class that only the docs site defines (the docs page shows
 * `menu-check-box`, which the package does not ship) would otherwise render
 * silently unstyled.
 */
const stylesheet = readFileSync(
  createRequire(import.meta.url).resolve('@philomena/philomena-css/dist/philomena.css'),
  'utf8',
);
const knownClasses = new Set(stylesheet.match(/(?<=\.)[a-zA-Z][\w-]*/g));

function classesOf(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)].flatMap(match => (match[1] ?? '').split(/\s+/)).filter(Boolean);
}

type AnyComponent = ComponentType<Record<string, unknown>>;

/** Each case renders one component with its modifiers on. */
const cases: Array<[name: string, component: unknown, props: Record<string, unknown>]> = [
  ['Alert', Alert.Alert, { type: 'danger', compact: true }],
  ['AlertIcon', Alert.AlertIcon, {}],
  ['AlertContent', Alert.AlertContent, {}],
  ['AlertTitle', Alert.AlertTitle, {}],
  ['AlertText', Alert.AlertText, {}],
  ['AlertActions', Alert.AlertActions, {}],
  ['Avatar', Avatar.Avatar, { size: 'md', square: true, src: '/a.png' }],
  ['AvatarGroup', Avatar.AvatarGroup, {}],
  ['Badge', Badge.Badge, { type: 'special' }],
  ['BadgePrefix', Badge.BadgePrefix, {}],
  ['BadgeSuffix', Badge.BadgeSuffix, {}],
  ['BadgeGroup', Badge.BadgeGroup, { compact: true }],
  ['Counter', Badge.Counter, { type: 'danger', subtle: true, corner: true }],
  ['CounterAnchor', Badge.CounterAnchor, {}],
  ['Burger', Burger.Burger, { open: true }],
  ['BurgerToggle', Burger.BurgerToggle, {}],
  ['BurgerOverlay', Burger.BurgerOverlay, { open: true }],
  ['BurgerHeader', Burger.BurgerHeader, {}],
  ['BurgerClose', Burger.BurgerClose, {}],
  ['BurgerItem', Burger.BurgerItem, { current: true }],
  ['BurgerIcon', Burger.BurgerIcon, {}],
  ['BurgerDivider', Burger.BurgerDivider, {}],
  [
    'Button',
    Button.Button,
    {
      type: 'primary',
      pressed: true,
      loading: true,
      iconOnly: true,
      fullWidth: true,
      justify: 'end',
      allowOverflow: true,
      sizeInput: true,
      sizeBadge: true,
    },
  ],
  ['ButtonGroup', Button.ButtonGroup, { separated: true, sizeBadge: true }],
  ['ButtonIcon', Button.ButtonIcon, {}],
  ['ButtonText', Button.ButtonText, {}],
  ['LoadingIcon', Button.LoadingIcon, {}],
  ['Communication', Communication.Communication, { deleted: true }],
  ['CommunicationBody', Communication.CommunicationBody, {}],
  ['CommunicationAvatar', Communication.CommunicationAvatar, {}],
  ['CommunicationContent', Communication.CommunicationContent, {}],
  ['CommunicationAuthor', Communication.CommunicationAuthor, {}],
  ['CommunicationAuthorName', Communication.CommunicationAuthorName, {}],
  ['CommunicationText', Communication.CommunicationText, {}],
  ['CommunicationOptions', Communication.CommunicationOptions, {}],
  ['Content', Content.Content, {}],
  ['ContentContainer', Content.ContentContainer, {}],
  ['Blockquote', Content.Blockquote, {}],
  ['CodeBlock', Content.CodeBlock, { wrap: true }],
  ['CodeSpan', Content.CodeSpan, { small: true, baseFont: true }],
  ['Spoiler', Content.Spoiler, { revealed: true }],
  ['Clamp', Content.Clamp, { id: 'c' }],
  ['Collapsible', Content.Collapsible, { visible: true, animate: true }],
  ['CollapsibleInner', Content.CollapsibleInner, {}],
  ['CopyableText', Content.CopyableText, {}],
  ['CopyableTextData', Content.CopyableTextData, {}],
  ['Dropdown', Dropdown.Dropdown, { open: true, manual: true }],
  ['DropdownDetails', Dropdown.DropdownDetails, { manual: true }],
  ['DropdownMenu', Dropdown.DropdownMenu, { end: true, up: true }],
  ['DropdownItem', Dropdown.DropdownItem, { current: true, danger: true }],
  ['DropdownIcon', Dropdown.DropdownIcon, {}],
  ['DropdownDivider', Dropdown.DropdownDivider, {}],
  ['FormControlGroup', Forms.FormControlGroup, { vertical: true }],
  ['FormControlWrap', Forms.FormControlWrap, { disabled: true, fullWidth: true }],
  ['FormControl', Forms.FormControl, { buttons: true }],
  ['InputField', Forms.InputField, { fullWidth: true, invalid: true }],
  ['TextAreaField', Forms.TextAreaField, { fullWidth: true, invalid: true }],
  ['FormInputGroup', Forms.FormInputGroup, {}],
  ['FormInputGroupSymbol', Forms.FormInputGroupSymbol, {}],
  ['Checkbox', Forms.Checkbox, { label: 'a' }],
  ['Radio', Forms.Radio, { label: 'a' }],
  ['FormSwitch', Forms.FormSwitch, { label: 'a' }],
  ['Select', Forms.Select, { fullWidth: true }],
  ['FormMessage', Forms.FormMessage, { kind: 'error' }],
  ['FormControlSubmit', Forms.FormControlSubmit, {}],
  ['Slider', Forms.Slider, { fullWidth: true, fill: 40 }],
  ['ComboboxSuggestions', Forms.ComboboxSuggestions, {}],
  ['ComboboxSuggestionHeader', Forms.ComboboxSuggestionHeader, { overlay: true }],
  ['ComboboxSuggestionItem', Forms.ComboboxSuggestionItem, { selected: true, highlighted: true, addon: 'x' }],
  ['MenuSwitch', Forms.MenuSwitch, {}],
  ['Header', Header.Header, { nonStick: true }],
  ['HeaderBrand', Header.HeaderBrand, {}],
  ['HeaderBrandText', Header.HeaderBrandText, {}],
  ['Nav', Header.Nav, { horizontal: true }],
  ['NavLink', Header.NavLink, { current: true }],
  ['Flex', Layout.Flex, { column: true, wrap: true, gap: 'md', justify: 'between', middle: true, grow: true }],
  ['LayoutColumns', Layout.LayoutColumns, {}],
  ['LayoutSide', Layout.LayoutSide, {}],
  ['LayoutMain', Layout.LayoutMain, {}],
  ['LayoutNarrow', Layout.LayoutNarrow, { center: true }],
  ['GridFlex', Layout.GridFlex, {}],
  ['GridFlexItem', Layout.GridFlexItem, { basis: 30 }],
  ['Hidden', Layout.Hidden, {}],
  ['Hidden below', Layout.Hidden, { below: 'xl', from: 'sm', print: true }],
  ['MediaBox', MediaBox.MediaBox, { cover: true, muted: true, spoilered: true, type: 'danger' }],
  ['MediaBoxHeader', MediaBox.MediaBoxHeader, { actions: true, start: true }],
  ['MediaBoxAction', MediaBox.MediaBoxAction, { kind: 'upvote', active: true, disabled: true }],
  ['MediaBoxScore', MediaBox.MediaBoxScore, {}],
  ['MediaBoxContent', MediaBox.MediaBoxContent, {}],
  ['MediaBoxOverlay', MediaBox.MediaBoxOverlay, { bottom: true }],
  ['MediaBoxOverlays', MediaBox.MediaBoxOverlays, { bottom: true }],
  ['MediaBoxVeil', MediaBox.MediaBoxVeil, {}],
  ['MediaList', MediaBox.MediaList, {}],
  ['Navbar', Navbar.Navbar, {}],
  ['NavbarItem', Navbar.NavbarItem, { caret: true, pinned: true, current: true, hiddenBelow: 'xl' }],
  ['NavbarBurger', Navbar.NavbarBurger, {}],
  ['NavbarIcon', Navbar.NavbarIcon, {}],
  ['NavbarSpacer', Navbar.NavbarSpacer, {}],
  ['NavbarDropdown', Navbar.NavbarDropdown, { open: true, pinned: true }],
  ['NavbarMenu', Navbar.NavbarMenu, { end: true }],
  ['NavbarMenuItem', Navbar.NavbarMenuItem, { current: true }],
  ['NavbarMenuIcon', Navbar.NavbarMenuIcon, {}],
  ['NavbarMenuText', Navbar.NavbarMenuText, {}],
  ['NavbarMenuDivider', Navbar.NavbarMenuDivider, {}],
  ['Pagination', Pagination.Pagination, { type: 'success' }],
  ['PaginationLink current', Pagination.PaginationLink, { href: '/', current: true }],
  ['PaginationLink disabled', Pagination.PaginationLink, { href: '/', disabled: true }],
  ['PaginationLink span', Pagination.PaginationLink, {}],
  ['PaginationIcon', Pagination.PaginationIcon, {}],
  ['PaginationGap', Pagination.PaginationGap, {}],
  ['PaginationBar', Pagination.PaginationBar, {}],
  ['PaginationInfo', Pagination.PaginationInfo, {}],
  ['Card', Surfaces.Card, { type: 'primary' }],
  ['CardHeader', Surfaces.CardHeader, {}],
  ['Block', Surfaces.Block, { type: 'warning' }],
  ['BlockHeader', Surfaces.BlockHeader, { sub: true }],
  ['BlockHeaderActions', Surfaces.BlockHeaderActions, {}],
  ['BlockContent', Surfaces.BlockContent, {}],
  ['CardForms', Surfaces.CardForms, {}],
  ['CardFormsSection', Surfaces.CardFormsSection, {}],
  ['Accordion', Surfaces.Accordion, {}],
  ['AccordionItem', Surfaces.AccordionItem, { header: 'h' }],
  ['ToggleBox', Surfaces.ToggleBox, { id: 't', label: 'l' }],
  ['Tabs', Surfaces.Tabs, {}],
  ['Tab', Surfaces.Tab, { selected: true, disabled: true }],
  ['TabPanel', Surfaces.TabPanel, { selected: true }],
  ['Popup', Surfaces.Popup, { visible: true, wide: true, allowOverflow: true, hasAnchor: true }],
  ['Progress', Surfaces.Progress, { type: 'success', value: 40 }],
  ['Separator', Surfaces.Separator, { thin: true, vertical: true }],
  ['TableWrap', Surfaces.TableWrap, { responsive: true }],
  ['Table', Surfaces.Table, { striped: true, hover: true, type: 'danger' }],
  ['Tag', Tag.Tag, { category: 'character', muted: true }],
  ['TagIcon', Tag.TagIcon, {}],
  ['TagName', Tag.TagName, {}],
  ['TagCount', Tag.TagCount, {}],
  ['TagRemove', Tag.TagRemove, {}],
  ['TagList', Tag.TagList, {}],
  ['TagBox', Tag.TagBox, {}],
];

describe('philomena components', () => {
  it.each(cases)('%s only emits classes the package stylesheet defines', (_name, component, props) => {
    const html = renderToStaticMarkup(createElement(component as AnyComponent, props));
    const missing = classesOf(html).filter(name => !knownClasses.has(name));
    expect(missing).toEqual([]);
  });

  it('marks the current pagination link for assistive tech', () => {
    const html = renderToStaticMarkup(createElement(Pagination.PaginationLink, { href: '/2', current: true }));
    expect(html).toContain('aria-current="page"');
  });

  it('renders an unavailable pagination link as a span', () => {
    const html = renderToStaticMarkup(createElement(Pagination.PaginationLink, { href: '/2', disabled: true }));
    expect(html.startsWith('<span')).toBe(true);
  });

  it('renders the loading icon before the button content', () => {
    const html = renderToStaticMarkup(createElement(Button.Button, { loading: true }, 'Save'));
    expect(html.indexOf('loading-icon')).toBeLessThan(html.indexOf('button-content'));
    expect(html).toContain('aria-busy="true"');
  });

  it('never submits a form from a plain button', () => {
    expect(renderToStaticMarkup(createElement(Button.Button, {}, 'x'))).toContain('type="button"');
  });
});

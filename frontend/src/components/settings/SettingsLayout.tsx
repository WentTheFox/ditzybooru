import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { Flex } from '#/components/philomena/Layout';
import { SideTabs, SideTabsExpand, TabPanel, TabsNav, TabsTitle, tabClass } from '#/components/philomena/Surfaces';

const TOGGLE_ID = 'settings-sections';

/**
 * The frame every settings page shares: a column of section links beside the
 * page's own panel. On narrow screens the column folds into a selector that
 * shows the current section until it is opened.
 */
export function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Flex column gap="lg">
      <h1>Settings</h1>
      <SideTabs toggleId={TOGGLE_ID}>
        <TabsNav aria-label="Settings sections">
          <SideTabsExpand toggleId={TOGGLE_ID} />
          <TabsTitle>This browser</TabsTitle>
          <Link
            to="/settings/account"
            className={tabClass()}
            activeProps={{ className: tabClass(true), 'aria-current': 'page' }}
          >
            Account
          </Link>
          <Link
            to="/settings/developer"
            className={tabClass()}
            activeProps={{ className: tabClass(true), 'aria-current': 'page' }}
          >
            Developer
          </Link>
        </TabsNav>
        <TabPanel selected role="region" aria-label={title}>
          <Flex column gap="lg">
            {children}
          </Flex>
        </TabPanel>
      </SideTabs>
    </Flex>
  );
}

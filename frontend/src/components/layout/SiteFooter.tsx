import { Link } from '@tanstack/react-router';

import { Flex } from '#/components/philomena/Layout';
import { Nav, navLinkClass } from '#/components/philomena/Header';
import { ContentContainer } from '#/components/philomena/Content';
import { footerColumns } from '#/lib/mock/site';

/** The site footer: resource/help/community link columns and serving info. */
export function SiteFooter() {
  return (
    <footer className="site-footer py-xl">
      <ContentContainer>
        <Flex wrap gap="xl">
          {footerColumns.map(column => (
            <div key={column.title}>
              {/* `h2`, not `h5`: the footer's columns are top-level sections of
                  the page, and skipping straight to h5 breaks the outline. */}
              <h2>{column.title}</h2>
              <Nav aria-label={column.title}>
                {column.links.map(link => {
                  const label = link.bold ? <strong>{link.label}</strong> : link.label;

                  return link.external ? (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={navLinkClass()}>
                      {label}
                    </a>
                  ) : (
                    <Link key={link.href} to={link.href} className={navLinkClass()}>
                      {label}
                    </Link>
                  );
                })}
              </Nav>
            </div>
          ))}
        </Flex>

        <p className="muted-text text-center">
          A modern frontend for{' '}
          <a href="https://github.com/philomena-dev/philomena" target="_blank" rel="noreferrer">
            philomena
          </a>
          . Rendered with mock data.
        </p>
      </ContentContainer>
    </footer>
  );
}

import { Avatar } from '#/components/philomena/Avatar';
import { useSite } from '#/hooks/use-site';

/**
 * The site's logo, or its first letter when it has none.
 *
 * Decorative either way: the link or heading next to it carries the name.
 */
export function BrandMark() {
  const site = useSite();

  return (
    <Avatar size="xs" square aria-hidden="true" src={site.logo ?? undefined}>
      {site.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}

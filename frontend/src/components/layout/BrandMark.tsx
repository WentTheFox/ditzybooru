import { Avatar } from '#/components/philomena/Avatar';
import { useSite } from '#/hooks/use-site';

/**
 * The site's logo, or its first letter when it has none.
 *
 * Decorative either way: the link or heading next to it carries the name.
 *
 * A logo is not an `Avatar`. The package paints an avatar on a filled plate,
 * clips it to rounded corners and crops the picture to fill (`object-fit: cover`),
 * which is right for a user's photo and wrong for a logo, whose edges are the
 * design. So a logo is a plain image: only its height is set (the avatar-xs
 * size), which leaves its width to its own aspect ratio, and it has no
 * background. The letter fallback has no picture of its own, so it keeps the
 * avatar's colored square.
 */
export function BrandMark() {
  const site = useSite();

  if (site.logo !== null) {
    return <img src={site.logo} alt="" aria-hidden="true" height={28} />;
  }

  return (
    <Avatar size="xs" square aria-hidden="true">
      {site.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}

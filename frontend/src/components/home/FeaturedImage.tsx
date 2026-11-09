import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataSource } from '#/hooks/use-data-source';
import { featuredMediaQuery } from '#/lib/api/queries';
import { SidebarBlock } from './SidebarBlock';
import { MediaBox } from './MediaBox';

/** The featured image spotlighted at the top of the activity sidebar. */
export function FeaturedImage() {
  const { data: image } = useSuspenseQuery(featuredMediaQuery(useDataSource()));

  return (
    <SidebarBlock title="Featured">
      <MediaBox bar={false} image={image} src={image.representations.medium} />
    </SidebarBlock>
  );
}

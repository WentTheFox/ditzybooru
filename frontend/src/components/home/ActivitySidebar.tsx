import { BrowserRetry } from '#/components/ui/BrowserRetry';
import { useDataSource } from '#/hooks/use-data-source';
import { featuredMediaQuery, recentCommentsQuery, trendingMediaQuery } from '#/lib/api/queries';

import { FeaturedImage } from './FeaturedImage';
import { TRENDING_COUNT, TrendingImages } from './TrendingImages';
import { LiveStreamsBlock } from './LiveStreamsBlock';
import { ForumActivityBlock } from './ForumActivityBlock';
import { RECENT_COMMENT_COUNT, RecentCommentsBlock } from './RecentCommentsBlock';

/**
 * The home page's activity column: featured and trending images, then streams,
 * forum and comment feeds. The blocks are direct children of the page's side
 * column, which is what gives them the package's spacing between blocks.
 */
export function ActivitySidebar() {
  const kind = useDataSource();
  return (
    <>
      <BrowserRetry queryKey={featuredMediaQuery(kind).queryKey} label="the featured image">
        <FeaturedImage />
      </BrowserRetry>
      <BrowserRetry queryKey={trendingMediaQuery(kind, TRENDING_COUNT).queryKey} label="trending images">
        <TrendingImages />
      </BrowserRetry>
      <LiveStreamsBlock />
      <ForumActivityBlock />
      <BrowserRetry queryKey={recentCommentsQuery(kind, RECENT_COMMENT_COUNT).queryKey} label="recent comments">
        <RecentCommentsBlock />
      </BrowserRetry>
    </>
  );
}

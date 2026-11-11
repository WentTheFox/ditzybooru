import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';

import type { Comment } from '#/lib/types';
import { useDataSource } from '#/hooks/use-data-source';
import { recentCommentsQuery } from '#/lib/api/queries';
import { TRENDING_WINDOW, searchSorts } from '#/lib/api/sorts';
import { Avatar } from '#/components/philomena/Avatar';
import { RelativeTime } from '#/components/ui/RelativeTime';
import { SidebarBlock } from './SidebarBlock';
import { UserAttribution } from './UserAttribution';

function CommentStrip({ comment }: { comment: Comment }) {
  const imageId = comment.imageId;

  return (
    <li className="flex items-center gap-md">
      <Link to="/images/$id" params={{ id: imageId }} aria-label={`Image ${imageId}`}>
        <Avatar size="xs" square src={comment.imageThumbTiny} />
      </Link>
      <div className="flex-1">
        <div className="truncate">
          <Link to="/images/$id" params={{ id: imageId }} hash={`comment_${comment.id}`}>
            #{imageId}
          </Link>{' '}
          <span className="muted-text">by</span> <UserAttribution author={comment.author} />
        </div>
        <div className="muted-text">
          <RelativeTime dateTime={comment.createdAt} />
        </div>
      </div>
    </li>
  );
}

const mostCommentedQuery = `/search?q=${encodeURIComponent(TRENDING_WINDOW)}&sf=${searchSorts.commentCount.sf}&sd=${searchSorts.commentCount.sd}`;

/** How many comments the strip holds. */
export const RECENT_COMMENT_COUNT = 6;

/** "Recent Comments" block. */
export function RecentCommentsBlock() {
  const { data: comments } = useSuspenseQuery(recentCommentsQuery(useDataSource(), RECENT_COMMENT_COUNT));

  return (
    <SidebarBlock
      title="Recent Comments"
      href="/comments"
      icon={<MessageCircle size={16} />}
      footer={{ label: 'Most Commented-on Images', href: mostCommentedQuery }}
    >
      <ul className="flex flex-col gap-md">
        {comments.map(comment => (
          <CommentStrip key={comment.id} comment={comment} />
        ))}
      </ul>
    </SidebarBlock>
  );
}

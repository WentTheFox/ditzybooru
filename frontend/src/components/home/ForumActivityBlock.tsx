import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MessagesSquare, Pin } from 'lucide-react';

import { Alert, AlertText } from '#/components/philomena/Alert';
import { Button, ButtonText } from '#/components/philomena/Button';
import { Flex } from '#/components/philomena/Layout';
import { RelativeTime } from '#/components/ui/RelativeTime';
import { useDataSource } from '#/hooks/use-data-source';
import { useInView } from '#/hooks/use-in-view';
import { recentTopicsQuery } from '#/lib/api/queries';
import type { ForumTopic } from '#/lib/types';
import { SidebarBlock } from './SidebarBlock';

/** How many topics the block holds. */
const FORUM_TOPIC_COUNT = 6;

function TopicStrip({ topic }: { topic: ForumTopic }) {
  return (
    <li>
      {topic.sticky ? <Pin size={12} /> : null}
      <Link to="/forums/$forum/topics/$topic" params={{ forum: topic.forum.slug, topic: topic.slug }}>
        <strong>{topic.title}</strong>
      </Link>{' '}
      <span className="muted-text">in</span>{' '}
      <Link to="/forums/$forum" params={{ forum: topic.forum.slug }}>
        {topic.forum.name}
      </Link>{' '}
      <RelativeTime className="muted-text" dateTime={topic.lastRepliedAt} />
    </li>
  );
}

/**
 * "Forum Activity" block: recently active topics.
 *
 * The slowest request on the page - the backend asks every forum - so it is
 * neither in the route loader nor in the server render. It loads in the browser
 * once the block is near the viewport, and not at all for a visitor who never
 * scrolls to it.
 */
export function ForumActivityBlock() {
  const kind = useDataSource();
  const [ref, inView] = useInView();
  const {
    data: topics,
    isError,
    refetch,
  } = useQuery({ ...recentTopicsQuery(kind, FORUM_TOPIC_COUNT), enabled: inView });

  let body;
  if (topics !== undefined) {
    body = (
      <ul className="flex flex-column gap-md">
        {topics.map(topic => (
          <TopicStrip key={`${topic.forum.slug}/${topic.slug}`} topic={topic} />
        ))}
      </ul>
    );
  } else if (isError) {
    body = (
      <Alert type="danger">
        <Flex center wrap gap="md" justify="between">
          <AlertText>Could not load forum activity.</AlertText>
          <Button
            sizeBadge
            onClick={() => {
              void refetch();
            }}
          >
            <ButtonText>Retry</ButtonText>
          </Button>
        </Flex>
      </Alert>
    );
  } else {
    body = <p className="muted-text">Loading&hellip;</p>;
  }

  return (
    <SidebarBlock ref={ref} title="Forum Activity" href="/forums" icon={<MessagesSquare size={16} />}>
      {body}
    </SidebarBlock>
  );
}

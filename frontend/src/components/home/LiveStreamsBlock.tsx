import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Radio } from 'lucide-react';

import { useDataSource } from '#/hooks/use-data-source';
import { useInView } from '#/hooks/use-in-view';
import { liveStreamsQuery } from '#/lib/api/queries';
import type { LiveStreamChannel } from '#/lib/types';
import { Alert, AlertText } from '#/components/philomena/Alert';
import { Badge } from '#/components/philomena/Badge';
import { Button, ButtonText } from '#/components/philomena/Button';
import { Flex } from '#/components/philomena/Layout';
import { Int } from '#/components/ui/Int';
import { SidebarBlock } from './SidebarBlock';

function ChannelStrip({ channel }: { channel: LiveStreamChannel }) {
  return (
    <li>
      <Link
        // @ts-expect-error TODO: route not built yet
        to={`/channels/${channel.id}`}
        className="flex items-center gap-md"
      >
        <span className="flex-1 truncate">
          {channel.title}
          {channel.nsfw ? <span title="NSFW"> 🔞</span> : null}
        </span>

        {channel.isLive ? (
          <span className="flex items-center gap-md flex-none">
            <span className="muted-text">
              <Int value={channel.viewers} /> {channel.viewers === 1 ? 'viewer' : 'viewers'}
            </span>
            <Badge type="success">LIVE</Badge>
          </span>
        ) : (
          <Badge type="danger" className="flex-none">
            OFF AIR
          </Badge>
        )}
      </Link>
    </li>
  );
}

/** How many channels the block holds. */
const CHANNEL_COUNT = 6;

/** Live channels first, the busiest on top; the rest keep the site's order. */
function liveFirst(channels: Array<LiveStreamChannel>): Array<LiveStreamChannel> {
  return channels
    .map((channel, index) => ({ channel, index }))
    .sort(
      (a, b) =>
        Number(b.channel.isLive) - Number(a.channel.isLive) ||
        b.channel.viewers - a.channel.viewers ||
        a.index - b.index,
    )
    .map(({ channel }) => channel)
    .slice(0, CHANNEL_COUNT);
}

/**
 * "Live Streams" block. Loaded in the browser once the block is near the
 * viewport rather than with the page, like the forum activity block, and
 * absent altogether on a site that has no livestream page.
 */
export function LiveStreamsBlock() {
  const kind = useDataSource();
  const [ref, inView] = useInView();
  const { data: channels, isError, refetch } = useQuery({ ...liveStreamsQuery(kind), enabled: inView });

  if (channels === null) {
    return null;
  }

  let body;
  if (channels !== undefined) {
    body = (
      <ul className="flex flex-col gap-md">
        {liveFirst(channels).map(channel => (
          <ChannelStrip key={channel.id} channel={channel} />
        ))}
      </ul>
    );
  } else if (isError) {
    body = (
      <Alert type="danger">
        <Flex center wrap gap="md" justify="between">
          <AlertText>Could not load the streams.</AlertText>
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
    <SidebarBlock ref={ref} title="Live Streams" href="/channels" icon={<Radio size={16} />}>
      {body}
    </SidebarBlock>
  );
}

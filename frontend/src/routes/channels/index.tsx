import { createFileRoute } from '@tanstack/react-router';

import { Badge } from '#/components/philomena/Badge';
import { ContentContainer } from '#/components/philomena/Content';
import { Avatar } from '#/components/philomena/Avatar';
import { Flex } from '#/components/philomena/Layout';
import { Card } from '#/components/philomena/Surfaces';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { channelsQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/channels/')({
  component: ChannelsPage,
  loader: ({ context }) => prefetchLive(context, channelsQuery()),
});

/** `/channels`: the tracked livestream channels, live ones first. */
function ChannelsPage() {
  const { kind, data, error, isPending, refetch } = useLiveQuery(channelsQuery());

  return (
    <ContentContainer>
      <h1>Livestreams</h1>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="list of channels">
        {channels => (
          <Flex column gap="lg">
            {channels.map(channel => (
              <Card key={channel.id}>
                <Flex gap="lg">
                  <Avatar size="lg" square src={channel.thumbnailUrl} />
                  <div>
                    <h2>{channel.title}</h2>
                    {channel.live ? (
                      <Badge type="danger">Live{channel.viewers === null ? '' : ` - ${channel.viewers} viewers`}</Badge>
                    ) : null}{' '}
                    {channel.nsfw ? <Badge type="danger">NSFW</Badge> : null}
                    {channel.artistTag === null ? null : (
                      <p className="muted-text">
                        <a href={`/search?q=${encodeURIComponent(channel.artistTag)}`}>{channel.artistTag}</a>
                      </p>
                    )}
                  </div>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </QueryState>
    </ContentContainer>
  );
}

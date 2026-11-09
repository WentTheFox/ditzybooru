import { createFileRoute } from '@tanstack/react-router';

import { Avatar } from '#/components/philomena/Avatar';
import { Flex, LayoutNarrow } from '#/components/philomena/Layout';
import { Block, BlockContent, BlockHeader, Table } from '#/components/philomena/Surfaces';
import { Prose } from '#/components/ui/Prose';
import { QueryState } from '#/components/ui/QueryState';
import { RelativeTime } from '#/components/ui/RelativeTime';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { profileQuery } from '#/lib/api/queries';
import { initials } from '#/lib/format';

export const Route = createFileRoute('/profiles/$slug')({
  component: ProfileRoute,
  loader: ({ context, params }) => prefetchLive(context, profileQuery(params.slug)),
});

/** `/profiles/:slug`: a user, what they say about themselves, and what they have been up to. */
function ProfileRoute() {
  const { slug } = Route.useParams();
  const { kind, data, error, isPending, refetch } = useLiveQuery(profileQuery(slug));

  return (
    <LayoutNarrow center>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="profile">
        {profile => (
          <>
            <Flex center gap="lg">
              <Avatar size="sm" src={profile.avatarUrl ?? undefined} alt={profile.name}>
                {initials(profile.name)}
              </Avatar>
              <h1>{profile.name}</h1>
            </Flex>
            <p className="muted-text">
              Member since <RelativeTime dateTime={profile.createdAt} />
              {' · '}
              <a href={`/search?q=${encodeURIComponent(`uploader_id:${profile.id}`)}`}>Uploads</a>
              {' · '}
              <a href={`/search?q=${encodeURIComponent(`faved_by_id:${profile.id}`)}`}>Favorites</a>
              {' · '}
              <a href={`/comments?cq=${encodeURIComponent(`author_id:${profile.id}`)}`}>Comments</a>
            </p>
            {profile.aboutHtml === null || profile.aboutHtml === '' ? null : (
              <Block>
                <BlockHeader>About me</BlockHeader>
                <BlockContent>
                  <Prose html={profile.aboutHtml} />
                </BlockContent>
              </Block>
            )}
            <Block>
              <BlockHeader>Statistics (last 90 days)</BlockHeader>
              <BlockContent>
                <Table striped>
                  <tbody>
                    {profile.stats.map(stat => (
                      <tr key={stat.label}>
                        <th scope="row">{stat.label}</th>
                        <td className="numeric">{stat.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </BlockContent>
            </Block>
          </>
        )}
      </QueryState>
    </LayoutNarrow>
  );
}

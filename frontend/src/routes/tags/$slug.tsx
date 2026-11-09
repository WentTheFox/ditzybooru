import { createFileRoute, Link } from '@tanstack/react-router';

import { ContentContainer } from '#/components/philomena/Content';
import { Flex } from '#/components/philomena/Layout';
import { Card, CardHeader } from '#/components/philomena/Surfaces';
import { Tag, TagList } from '#/components/philomena/Tag';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { tagQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/tags/$slug')({
  component: TagPage,
  loader: ({ context, params }) => prefetchLive(context, tagQuery(params.slug)),
});

function TagChips({ names }: { names: Array<string> }) {
  return (
    <TagList>
      {names.map(name => (
        <Tag key={name}>
          <a href={`/search?q=${encodeURIComponent(name)}`}>{name}</a>
        </Tag>
      ))}
    </TagList>
  );
}

function TagSection({ title, names }: { title: string; names: Array<string> }) {
  if (names.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <TagChips names={names} />
    </Card>
  );
}

/** `/tags/:slug`: what the site says about one tag. */
function TagPage() {
  const { slug } = Route.useParams();
  const { kind, data, error, isPending, refetch } = useLiveQuery(tagQuery(slug));

  return (
    <ContentContainer>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="tag">
        {tag => (
          <Flex column gap="lg">
            <p className="muted-text">
              <Link to="/search" search={{ q: tag.name, page: 1 }}>
                {tag.imageCount.toLocaleString()} images
              </Link>
              {tag.category === null ? null : <> &middot; {tag.category}</>}
            </p>
            <h1>{tag.name}</h1>
            {tag.aliasedTag === null ? null : (
              <p>
                This tag is an alias of{' '}
                <Link to="/tags/$slug" params={{ slug: tag.aliasedTag }}>
                  {tag.aliasedTag}
                </Link>
                .
              </p>
            )}
            {tag.description === '' ? null : <p className="plain-text">{tag.description}</p>}
            <TagSection title="Aliases" names={tag.aliases} />
            <TagSection title="Implies" names={tag.impliedTags} />
            <TagSection title="Implied by" names={tag.impliedByTags} />
          </Flex>
        )}
      </QueryState>
    </ContentContainer>
  );
}

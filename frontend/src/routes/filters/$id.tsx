import { createFileRoute, Link } from '@tanstack/react-router';

import { CodeSpan, ContentContainer } from '#/components/philomena/Content';
import { Flex } from '#/components/philomena/Layout';
import { Card, CardHeader } from '#/components/philomena/Surfaces';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { filterQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/filters/$id')({
  component: FilterPage,
  params: {
    // A bad id is not the router's error: the page says there is no such filter.
    parse: ({ id }: { id: string }) => ({ id: Number(id) }),
    stringify: ({ id }: { id: number }) => ({ id: String(id) }),
  },
  loader: ({ context, params }) => prefetchLive(context, filterQuery(params.id)),
});

function QuerySection({ title, complex, tagCount }: { title: string; complex: null | string; tagCount: number }) {
  if (complex === null && tagCount === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      {tagCount === 0 ? null : <p>{tagCount.toLocaleString()} tags</p>}
      {complex === null ? null : <CodeSpan>{complex}</CodeSpan>}
    </Card>
  );
}

/** `/filters/:id`: one filter. */
function FilterPage() {
  const { id } = Route.useParams();
  const { kind, data, error, isPending, refetch } = useLiveQuery(filterQuery(id));

  return (
    <ContentContainer>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="filter">
        {filter => (
          <Flex column gap="lg">
            <p className="muted-text">
              <Link to="/filters">Filters</Link> &raquo; {filter.name}
            </p>
            <h1>{filter.name}</h1>
            {filter.description === '' ? null : <p>{filter.description}</p>}
            <p className="muted-text">Used by {filter.userCount.toLocaleString()} users</p>
            <QuerySection title="Hidden" complex={filter.hiddenComplex} tagCount={filter.hiddenTagIds.length} />
            <QuerySection
              title="Spoilered"
              complex={filter.spoileredComplex}
              tagCount={filter.spoileredTagIds.length}
            />
          </Flex>
        )}
      </QueryState>
    </ContentContainer>
  );
}

import { createFileRoute, Link } from '@tanstack/react-router';

import { ContentContainer } from '#/components/philomena/Content';
import { Flex } from '#/components/philomena/Layout';
import { Card, CardHeader } from '#/components/philomena/Surfaces';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { systemFiltersQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/filters/')({
  component: FiltersPage,
  loader: ({ context }) => prefetchLive(context, systemFiltersQuery()),
});

/** `/filters`: the filters the site provides to everyone. */
function FiltersPage() {
  const { kind, data, error, isPending, refetch } = useLiveQuery(systemFiltersQuery());

  return (
    <ContentContainer>
      <h1>Filters</h1>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="list of filters">
        {filters => (
          <Flex column gap="lg">
            {filters.map(filter => (
              <Card key={filter.id}>
                <CardHeader>
                  <Link to="/filters/$id" params={{ id: filter.id }}>
                    {filter.name}
                  </Link>
                </CardHeader>
                <p>{filter.description}</p>
                <p className="muted-text">Used by {filter.userCount.toLocaleString()} users</p>
              </Card>
            ))}
          </Flex>
        )}
      </QueryState>
    </ContentContainer>
  );
}

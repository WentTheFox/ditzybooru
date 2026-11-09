import { createFileRoute, Link } from '@tanstack/react-router';

import { Table, TableWrap } from '#/components/philomena/Surfaces';
import { LayoutNarrow } from '#/components/philomena/Layout';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { forumsQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/forums/')({
  component: Forums,
  loader: ({ context }) => prefetchLive(context, forumsQuery()),
});

/** `/forums`: every forum, as Philomena lists them. */
function Forums() {
  const { kind, data, error, isPending, refetch } = useLiveQuery(forumsQuery());

  return (
    <LayoutNarrow center>
      <h1>Discussion Forums</h1>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="page">
        {forums => (
          <TableWrap responsive>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Forum</th>
                  <th className="numeric">Topics</th>
                  <th className="numeric">Posts</th>
                </tr>
              </thead>
              <tbody>
                {forums.map(forum => (
                  <tr key={forum.slug}>
                    <td>
                      <Link to="/forums/$forum" params={{ forum: forum.slug }}>
                        {forum.name}
                      </Link>
                      <div className="muted-text">{forum.description}</div>
                    </td>
                    <td className="numeric">{forum.topicCount}</td>
                    <td className="numeric">{forum.postCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </QueryState>
    </LayoutNarrow>
  );
}

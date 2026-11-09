import { createFileRoute, Link } from '@tanstack/react-router';
import { Lock, Pin } from 'lucide-react';

import { Table, TableWrap } from '#/components/philomena/Surfaces';
import { LayoutNarrow } from '#/components/philomena/Layout';
import { Pagination } from '#/components/ui/Pagination';
import { QueryState } from '#/components/ui/QueryState';
import { RelativeTime } from '#/components/ui/RelativeTime';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { forumQuery, forumTopicsQuery } from '#/lib/api/queries';
import { pageSearch } from '#/lib/page-search';

/** The site puts this many topics on a page. */
const TOPICS_PER_PAGE = 25;

export const Route = createFileRoute('/forums/$forum/')({
  component: ForumPage,
  validateSearch: pageSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      prefetchLive(context, forumQuery(params.forum)),
      prefetchLive(context, forumTopicsQuery(params.forum, deps.page ?? 1, TOPICS_PER_PAGE)),
    ]);
  },
});

/** `/forums/:forum`: a forum and its topics. */
function ForumPage() {
  const { forum: slug } = Route.useParams();
  const { page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const forum = useLiveQuery(forumQuery(slug));
  const topics = useLiveQuery(forumTopicsQuery(slug, page, TOPICS_PER_PAGE));

  return (
    <LayoutNarrow center>
      <QueryState
        kind={forum.kind}
        data={forum.data}
        error={forum.error}
        isPending={forum.isPending}
        refetch={forum.refetch}
        what="forum"
      >
        {info => (
          <>
            <p className="muted-text">
              <Link to="/forums">Forums</Link> &raquo; {info.name}
            </p>
            <h1>{info.name}</h1>
            <p className="muted-text">{info.description}</p>
          </>
        )}
      </QueryState>
      {forum.data === undefined ? null : (
        <QueryState
          kind={topics.kind}
          data={topics.data}
          error={topics.error}
          isPending={topics.isPending}
          refetch={topics.refetch}
          what="list of topics"
        >
          {list => (
            <>
              <TableWrap responsive>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th className="numeric">Posts</th>
                      <th>Last reply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.items.map(topic => (
                      <tr key={topic.slug}>
                        <td>
                          {topic.sticky ? <Pin size={12} aria-label="Sticky" /> : null}
                          {topic.locked ? <Lock size={12} aria-label="Locked" /> : null}{' '}
                          <Link to="/forums/$forum/topics/$topic" params={{ forum: slug, topic: topic.slug }}>
                            {topic.title}
                          </Link>
                          <div className="muted-text">by {topic.author}</div>
                        </td>
                        <td className="numeric">{topic.postCount}</td>
                        <td>
                          <RelativeTime dateTime={topic.lastRepliedAt} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
              {list.total > TOPICS_PER_PAGE ? (
                <Pagination
                  label="Topics"
                  page={page}
                  pageCount={Math.ceil(list.total / TOPICS_PER_PAGE)}
                  onPageChange={nextPage => {
                    void navigate({ search: { page: nextPage } });
                  }}
                />
              ) : null}
            </>
          )}
        </QueryState>
      )}
    </LayoutNarrow>
  );
}

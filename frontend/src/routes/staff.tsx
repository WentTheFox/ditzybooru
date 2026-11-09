import { createFileRoute, Link } from '@tanstack/react-router';

import { Avatar } from '#/components/philomena/Avatar';
import { Flex, LayoutNarrow } from '#/components/philomena/Layout';
import { Table, TableWrap } from '#/components/philomena/Surfaces';
import { QueryState } from '#/components/ui/QueryState';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { staffQuery } from '#/lib/api/queries';
import { initials } from '#/lib/format';

export const Route = createFileRoute('/staff')({
  component: Staff,
  loader: ({ context }) => prefetchLive(context, staffQuery()),
});

function Staff() {
  const { kind, data, error, isPending, refetch } = useLiveQuery(staffQuery());

  return (
    <LayoutNarrow center>
      <h1>Staff</h1>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="page">
        {groups =>
          groups.map(group => (
            <section key={group.name}>
              <h2>{group.name}</h2>
              <p className="muted-text">{group.description}</p>
              <TableWrap responsive>
                <Table striped>
                  <tbody>
                    {group.members.map(member => (
                      <tr key={member.name}>
                        <td>
                          <Flex center gap="lg">
                            <Avatar size="xs" src={member.avatarUrl ?? undefined} alt={member.name}>
                              {initials(member.name)}
                            </Avatar>
                            <strong>
                              <Link
                                to="/profiles/$slug"
                                params={{ slug: decodeURIComponent(member.profileUrl.split('/').pop() ?? member.name) }}
                              >
                                {member.name}
                              </Link>
                            </strong>
                          </Flex>
                        </td>
                        <td className="muted-text">{member.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            </section>
          ))
        }
      </QueryState>
    </LayoutNarrow>
  );
}

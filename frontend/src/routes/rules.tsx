import { createFileRoute } from '@tanstack/react-router';

import { Badge } from '#/components/philomena/Badge';
import { LayoutNarrow } from '#/components/philomena/Layout';
import { Accordion, AccordionItem, Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';
import { Prose } from '#/components/ui/Prose';
import { QueryState } from '#/components/ui/QueryState';
import { RelativeTime } from '#/components/ui/RelativeTime';
import { useLiveQuery } from '#/hooks/use-live-query';
import { prefetchLive } from '#/lib/api/prefetch';
import { rulesQuery } from '#/lib/api/queries';

export const Route = createFileRoute('/rules')({
  component: Rules,
  loader: ({ context }) => prefetchLive(context, rulesQuery()),
});

function Rules() {
  const { kind, data, error, isPending, refetch } = useLiveQuery(rulesQuery());

  return (
    <LayoutNarrow center>
      <h1>Site Rules</h1>
      <QueryState kind={kind} data={data} error={error} isPending={isPending} refetch={refetch} what="page">
        {rules => (
          <>
            <p className="muted-text">
              The rules were last updated <RelativeTime dateTime={rules.updatedAt} />.
            </p>
            {rules.items.map(rule => (
              <Block key={rule.id} id={String(rule.id)}>
                <BlockHeader>
                  {rule.title}
                  {rule.important ? <Badge type="danger">Important</Badge> : null}
                </BlockHeader>
                <BlockContent>
                  <Prose html={rule.bodyHtml} />
                </BlockContent>
                {rule.examplesHtml === null ? null : (
                  <Accordion>
                    <AccordionItem header="View examples">
                      <Prose html={rule.examplesHtml} />
                    </AccordionItem>
                  </Accordion>
                )}
              </Block>
            ))}
          </>
        )}
      </QueryState>
    </LayoutNarrow>
  );
}

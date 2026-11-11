import type { ReactNode } from 'react';

import { Alert, AlertText } from '#/components/philomena/Alert';
import { Button } from '#/components/philomena/Button';
import { Flex } from '#/components/philomena/Layout';
import { HttpError } from '#/lib/http/http-client';
import type { DataSourceKind } from '#/lib/api/types';

interface QueryStateProps<TData> {
  kind: DataSourceKind;
  data: TData | undefined;
  error: Error | null;
  isPending: boolean;
  refetch: () => unknown;
  /** What a missing thing is called: "page", "forum". */
  what: string;
  children: (data: TData) => ReactNode;
}

function StateAlert({
  type,
  title,
  actions,
  children,
}: {
  type?: 'warning' | 'danger';
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Alert type={type}>
      <Flex center wrap gap="md" justify="between">
        <AlertText>
          <strong>{title}</strong>
          {children === undefined ? null : <> {children}</>}
        </AlertText>
        {actions}
      </Flex>
    </Alert>
  );
}

/**
 * Everything a page that reads from the live source can be instead of its
 * content: on mock data, loading, missing, or failed.
 */
export function QueryState<TData>({ kind, data, error, isPending, refetch, what, children }: QueryStateProps<TData>) {
  if (data !== undefined) {
    return children(data);
  }
  if (kind !== 'live') {
    return (
      <StateAlert title="Mock data is on">
        This page comes from the site itself, so it needs the live data source. Switch to it in the developer settings.
      </StateAlert>
    );
  }
  if (error instanceof HttpError && error.response.status === 404) {
    return (
      <StateAlert type="warning" title="Not found">
        There is no such {what}.
      </StateAlert>
    );
  }
  if (error instanceof HttpError && error.response.status === 501) {
    return (
      <StateAlert type="warning" title="Not available here">
        This site does not offer this page.
      </StateAlert>
    );
  }
  if (error !== null) {
    return (
      <StateAlert
        type="danger"
        title={`Could not load this ${what}`}
        actions={
          <Button
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
        }
      />
    );
  }

  return <p className="muted-text">{isPending ? 'Loading…' : null}</p>;
}

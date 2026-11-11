import { Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryErrorResetBoundary, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { CatchBoundary, useHydrated } from '@tanstack/react-router';

import { Alert, AlertText } from '#/components/philomena/Alert';
import { Button } from '#/components/philomena/Button';
import { Flex } from '#/components/philomena/Layout';
import { failedOnServer } from '#/lib/api/ssr-failures';

interface Props {
  /** The query that `children` read with `useSuspenseQuery`. */
  queryKey: QueryKey;
  /** What `children` show, for the messages. E.g. `"recent comments"`. */
  label: string;
  children: ReactNode;
}

/**
 * Shows a message in place of `children` if their query failed during SSR.
 * The browser renders `children` after hydration, and they fetch the query
 * again. The server and the hydration render give the same output, so React
 * reports no error. If the browser also fails, it shows an error with a retry
 * button.
 */
export function BrowserRetry({ queryKey, label, children }: Props) {
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const [serverFailed] = useState(() => failedOnServer(queryClient, queryKey));

  const pending = serverFailed ? (
    <Alert type="warning">
      <AlertText>Could not load {label} on the server. Retrying...</AlertText>
    </Alert>
  ) : null;

  if (!hydrated && serverFailed) {
    return pending;
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <CatchBoundary
          getResetKey={() => label}
          errorComponent={({ reset }) => (
            <Alert type="danger">
              <Flex center wrap gap="md" justify="between">
                <AlertText>Could not load {label}.</AlertText>
                <Button
                  sizeBadge
                  onClick={() => {
                    resetQueries();
                    reset();
                  }}
                >
                  Retry
                </Button>
              </Flex>
            </Alert>
          )}
        >
          <Suspense fallback={pending}>{children}</Suspense>
        </CatchBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

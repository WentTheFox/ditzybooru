import { Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryErrorResetBoundary, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { CatchBoundary, useHydrated } from '@tanstack/react-router';

import { Alert, AlertActions, AlertContent, AlertText } from '#/components/philomena/Alert';
import { Button } from '#/components/philomena/Button';
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
      <AlertContent>
        <AlertText>Could not load {label} on the server. Retrying...</AlertText>
      </AlertContent>
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
              <AlertContent>
                <AlertText>Could not load {label}.</AlertText>
              </AlertContent>
              <AlertActions>
                <Button
                  sizeBadge
                  onClick={() => {
                    resetQueries();
                    reset();
                  }}
                >
                  Retry
                </Button>
              </AlertActions>
            </Alert>
          )}
        >
          <Suspense fallback={pending}>{children}</Suspense>
        </CatchBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

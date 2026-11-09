import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Alert, AlertContent, AlertText, AlertTitle } from '#/components/philomena/Alert';
import { Button } from '#/components/philomena/Button';
import { FormControlGroup, FormControlSubmit, FormMessage, InputField } from '#/components/philomena/Forms';
import { Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';
import { Flex, LayoutNarrow } from '#/components/philomena/Layout';
import { useSite } from '#/hooks/use-site';
import { setApiKey, useApiKey } from '#/lib/api/api-key';
import { get } from '#/lib/api/backend/client';
import { HttpError } from '#/lib/http/http-client';

export const Route = createFileRoute('/settings/account')({ component: AccountSettingsPage });

/** `Button` takes its HTML `type` through `submit`, because `type` is its color. */
const SUBMIT = { submit: true };

type Check = { state: 'idle' } | { state: 'checking' } | { state: 'refused' } | { state: 'failed' };

/** Asks the site whether `key` is one of its keys, without saving it. */
async function check(key: string): Promise<Check> {
  try {
    await get('/filters/user', {}, { apiKey: key });
    return { state: 'idle' };
  } catch (error) {
    return error instanceof HttpError && error.response.status === 401 ? { state: 'refused' } : { state: 'failed' };
  }
}

function AccountSettingsPage() {
  const site = useSite();
  const saved = useApiKey();
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<Check>({ state: 'idle' });

  const save = (event: SubmitEvent) => {
    event.preventDefault();
    const key = draft.trim();
    if (key === '') {
      return;
    }
    setResult({ state: 'checking' });
    void check(key).then(outcome => {
      setResult(outcome);
      if (outcome.state === 'idle') {
        setApiKey(key);
        setDraft('');
      }
    });
  };

  return (
    <LayoutNarrow center>
      <Flex column gap="lg">
        <h1>Account</h1>

        <Alert>
          <AlertContent>
            <AlertTitle>Your API key</AlertTitle>
            <AlertText>
              When you are signed in to {site.name} here, this site fetches your personal API key for you, so there is
              nothing to enter. Where {site.name} would not take a sign-in (it asks for a captcha that only its own
              pages can show), paste the key from your account settings on {site.name} instead. Either way it stays in
              this browser and is sent only with the requests that need it.
            </AlertText>
          </AlertContent>
        </Alert>

        <Block>
          <BlockHeader>API key</BlockHeader>
          <BlockContent>
            <Flex column gap="lg">
              {saved === null ? null : (
                <div>
                  <p>A key is saved in this browser.</p>
                  <Button
                    onClick={() => {
                      setApiKey(null);
                    }}
                  >
                    Remove it
                  </Button>
                </div>
              )}
              <form onSubmit={save}>
                <FormControlGroup vertical>
                  <label htmlFor="api-key">{saved === null ? 'Your API key' : 'Replace it with another key'}</label>
                  <InputField
                    id="api-key"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    fullWidth
                    value={draft}
                    onChange={event => {
                      setDraft(event.target.value);
                    }}
                  />
                  <FormMessage kind={result.state === 'refused' || result.state === 'failed' ? 'error' : 'description'}>
                    <span role="status">
                      {result.state === 'checking' ? 'Checking the key…' : null}
                      {result.state === 'refused' ? `${site.name} does not accept this key.` : null}
                      {result.state === 'failed' ? 'Could not reach the site to check the key. Try again.' : null}
                    </span>
                  </FormMessage>
                  <FormControlSubmit>
                    <Button type="primary" disabled={draft.trim() === '' || result.state === 'checking'} {...SUBMIT}>
                      Save key
                    </Button>
                  </FormControlSubmit>
                </FormControlGroup>
              </form>
            </Flex>
          </BlockContent>
        </Block>
      </Flex>
    </LayoutNarrow>
  );
}

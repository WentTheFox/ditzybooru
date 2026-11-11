import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';

import { Alert, AlertText } from '#/components/philomena/Alert';
import { Button } from '#/components/philomena/Button';
import { Checkbox, FormControlGroup, FormControlSubmit, FormMessage, InputField } from '#/components/philomena/Forms';
import { Flex, LayoutNarrow } from '#/components/philomena/Layout';
import { Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';
import { HCaptcha } from '#/components/ui/HCaptcha';
import { SESSION_QUERY_KEY } from '#/hooks/use-session';
import { useDataSource } from '#/hooks/use-data-source';
import { useSite } from '#/hooks/use-site';
import {
  fetchLoginCaptcha,
  signIn,
  SignInRejected,
  SignInUnavailable,
  signInWithCode,
} from '#/lib/api/backend/session';
import type { Session } from '#/lib/api/backend/session';

export const Route = createFileRoute('/sessions/new')({ component: SignInPage });

/** `Button` takes its HTML `type` through `submit`, because `type` is its color. */
const SUBMIT = { submit: true };

function SignInPage() {
  const site = useSite();
  const kind = useDataSource();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<null | string>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<null | string>(null);
  // The site itself failed to take the sign-in: not something to retype.
  const [siteDown, setSiteDown] = useState(false);
  // Set once the password was right and the site wants a 2FA code.
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState('');
  // Browser only: the captcha is not part of the server render.
  const { data: siteKey, isError: captchaUnavailable } = useQuery({
    queryKey: ['login-captcha'],
    queryFn: fetchLoginCaptcha,
    enabled: kind === 'live' && typeof window !== 'undefined',
    staleTime: 60 * 60_000,
  });

  const ready =
    kind === 'live' &&
    (needsCode ? code.trim() !== '' : siteKey !== undefined && (siteKey === null || captchaToken !== null));

  const done = (session: Session) => {
    queryClient.setQueryData(SESSION_QUERY_KEY, session);
    void navigate({ to: '/' });
  };

  const failed = (error: unknown) => {
    setBusy(false);
    // A captcha token works once, so the visitor has to solve another.
    setCaptchaToken(null);
    setSiteDown(error instanceof SignInUnavailable);
    if (error instanceof SignInRejected) {
      setProblem(error.message);
    } else if (error instanceof SignInUnavailable) {
      setProblem(`${site.name} is not accepting sign-ins right now: it did not answer.`);
    } else {
      setProblem('Could not reach the site. Try again.');
    }
  };

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    setSiteDown(false);
    if (needsCode) {
      signInWithCode(code.trim(), rememberMe).then(done, (error: unknown) => {
        failed(error);
        // The site signs the visitor out after a wrong code: start over.
        setNeedsCode(false);
        setCode('');
      });
      return;
    }
    signIn({ email, password, rememberMe, captchaToken }).then(session => {
      if (session.secondFactorRequired) {
        setBusy(false);
        setNeedsCode(true);
        return;
      }
      done(session);
    }, failed);
  };

  const hasProblem = problem !== null || captchaFailed || captchaUnavailable;

  return (
    <LayoutNarrow center>
      <Flex column gap="lg">
        <h1>Sign in to {site.name}</h1>

        {kind === 'live' ? null : (
          <Alert type="warning">
            <AlertText>
              <strong>Mock data is on</strong> Signing in needs the live data source. Switch to it in the developer
              settings.
            </AlertText>
          </Alert>
        )}

        <Block>
          <BlockHeader>Sign in</BlockHeader>
          <BlockContent>
            <form onSubmit={submit}>
              <FormControlGroup vertical>
                {needsCode ? (
                  <>
                    <label htmlFor="sign-in-code">Your 2FA code</label>
                    <InputField
                      id="sign-in-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      fullWidth
                      value={code}
                      onChange={event => {
                        setCode(event.target.value);
                      }}
                    />
                    <FormMessage>
                      {site.name} asks for the code from your authenticator app, or one of your backup codes.
                    </FormMessage>
                  </>
                ) : (
                  <>
                    <label htmlFor="sign-in-email">Email</label>
                    <InputField
                      id="sign-in-email"
                      type="email"
                      autoComplete="username"
                      required
                      fullWidth
                      value={email}
                      onChange={event => {
                        setEmail(event.target.value);
                      }}
                    />
                    <label htmlFor="sign-in-password">Password</label>
                    <InputField
                      id="sign-in-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      fullWidth
                      value={password}
                      onChange={event => {
                        setPassword(event.target.value);
                      }}
                    />
                  </>
                )}
                <Checkbox
                  label="Remember me"
                  icon={<Check size={12} />}
                  checked={rememberMe}
                  onChange={event => {
                    setRememberMe(event.target.checked);
                  }}
                />
                {typeof siteKey === 'string' && !needsCode ? (
                  <HCaptcha
                    // A new widget after a failed try, as the old token is spent.
                    key={problem ?? 'first'}
                    siteKey={siteKey}
                    onToken={setCaptchaToken}
                    onError={() => {
                      setCaptchaFailed(true);
                    }}
                  />
                ) : null}
                <FormMessage kind={hasProblem ? 'error' : 'description'}>
                  <span role="status">
                    {problem}
                    {siteDown ? (
                      <>
                        {' '}
                        Try again later, or <Link to="/settings/account">sign in with an API key</Link> instead, which
                        needs no captcha.
                      </>
                    ) : null}
                    {captchaFailed ? 'The captcha could not be loaded.' : null}
                    {captchaUnavailable ? `Could not reach ${site.name} to start the sign-in.` : null}
                  </span>
                </FormMessage>
                <FormControlSubmit>
                  <Button type="primary" disabled={!ready || busy} {...SUBMIT}>
                    Sign in
                  </Button>
                </FormControlSubmit>
              </FormControlGroup>
            </form>
          </BlockContent>
        </Block>
      </Flex>
    </LayoutNarrow>
  );
}

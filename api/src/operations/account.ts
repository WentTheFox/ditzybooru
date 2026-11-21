import type { Operation } from '../dsl/operation.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { sessionFields } from './sessionFields.ts';

const TOKEN = { sel: 'meta[name=csrf-token]', attr: 'content' };

/** Philomena says why a form was turned down in flash messages and inline errors. */
const REJECTION = '.flash--warning, .flash--danger, .flash--error, .alert, .help-block';

interface NoticeForm {
  operationId: string;
  /** Our path under `/api/v1`. */
  path: string;
  summary: string;
  body: Operation['body'];
  /** The page that carries the form's token, and the one the submission leads to. */
  formPage: string;
  /** The submission. */
  request: { path: string; body: Record<string, string> };
  routes: string[];
  /** Where the site sends the visitor afterwards, when not the home page. */
  landing?: string;
  examples?: Operation['examples'];
  /** Path parameters of our path, e.g. a token from an email. */
  params?: Operation['params'];
  /** The upstream verb of the submission; the site's forms mostly use `PUT` or `PATCH`. */
  verb?: 'POST' | 'PUT' | 'PATCH';
  /** Only these flavors have the form. */
  flavors?: string[];
  /** For a signed-in visitor's own settings; the default is for a signed-out one. */
  signedIn?: true;
  /** The message is on the page the submission redirects to, not at `landing`. */
  follow?: true;
}

/**
 * A form an anonymous visitor submits and the site answers with a flash
 * message: sign up, or ask for an email. The answer is that message.
 */
function noticeForm(options: NoticeForm) {
  return defineOperation({
    operationId: options.operationId,
    path: options.path,
    method: 'post',
    summary: options.summary,
    tags: ['account'],
    ...(options.params ? { params: options.params } : {}),
    body: options.body,
    response: s.ref('Notice'),
    ...(options.examples ? { examples: options.examples } : {}),
    philomena: {
      routes: options.routes,
      auth: options.signedIn ? 'session' : 'session:anonymous',
      strategies: [
        {
          kind: 'form',
          flavors: options.flavors ?? ['philomena', 'furbooru'],
          form: { page: options.formPage, csrf: TOKEN },
          request: { method: options.verb ?? 'POST', ...options.request },
          result: {
            page: options.landing ?? '/',
            ...(options.follow ? { follow: true as const } : {}),
            select: {
              fields: {
                message: { sel: '.flash--success', text: true, optional: true },
                _took: { sel: '.flash--success', exists: true },
              },
            },
            // The site's flash is the only sign it took the form.
            must: ['/_took'],
            errors: REJECTION,
          },
        },
      ],
    },
  });
}

const captcha = { 'h-captcha-response': '{captchaToken}' };
const CAPTCHA_FIELD = s.optional(s.string());

export const createRegistration = noticeForm({
  operationId: 'createRegistration',
  path: '/registrations',
  summary: 'Sign up. The site then emails confirmation instructions.',
  body: s.object({
    name: s.string(),
    email: s.string(),
    password: s.string(),
    passwordConfirmation: s.string(),
    /** What the captcha widget gave the browser, when the site asks for a captcha. */
    captchaToken: CAPTCHA_FIELD,
  }),
  formPage: '/registrations/new',
  request: {
    path: '/registrations',
    body: {
      'user[name]': '{name}',
      'user[email]': '{email}',
      'user[password]': '{password}',
      'user[password_confirmation]': '{passwordConfirmation}',
      ...captcha,
    },
  },
  routes: ['POST /registrations', 'GET /registrations/new'],
  examples: {
    name: 'Verify Signup',
    email: 'verify.signup@example.com',
    password: 'a long enough password',
    passwordConfirmation: 'a long enough password',
  },
});

function emailForm(options: {
  operationId: string;
  path: string;
  summary: string;
  upstream: string;
  routes: string[];
}) {
  return noticeForm({
    operationId: options.operationId,
    path: options.path,
    summary: options.summary,
    body: s.object({ email: s.string(), captchaToken: CAPTCHA_FIELD }),
    formPage: `${options.upstream}/new`,
    request: { path: options.upstream, body: { 'user[email]': '{email}', ...captcha } },
    routes: options.routes,
    examples: { email: 'user@example.com' },
  });
}

export const requestPasswordReset = emailForm({
  operationId: 'requestPasswordReset',
  path: '/passwords',
  summary: 'Ask for a password reset email. The answer is the same whether or not the address is known.',
  upstream: '/passwords',
  routes: ['POST /passwords', 'GET /passwords/new'],
});

export const resendConfirmation = emailForm({
  operationId: 'resendConfirmation',
  path: '/confirmations',
  summary: 'Ask for the confirmation email again. The answer is the same whether or not the address is known.',
  upstream: '/confirmations',
  routes: ['POST /confirmations', 'GET /confirmations/new'],
});

export const requestUnlock = emailForm({
  operationId: 'requestUnlock',
  path: '/unlocks',
  summary:
    'Ask for the email that unlocks a locked account. The answer is the same whether or not the address is known.',
  upstream: '/unlocks',
  routes: ['POST /unlocks', 'GET /unlocks/new'],
});

const TOKEN_PARAM = [{ name: 'token', in: 'path' as const, schema: s.string(), required: true }];

export const confirmAccount = noticeForm({
  operationId: 'confirmAccount',
  path: '/confirmations/{token}',
  summary: 'Confirm an account with the token from the confirmation email.',
  body: s.object({}),
  params: TOKEN_PARAM,
  formPage: '/confirmations/{token}',
  request: { path: '/confirmations/{token}', body: {} },
  verb: 'PATCH',
  routes: ['PATCH /confirmations/:id', 'PUT /confirmations/:id', 'GET /confirmations/:id'],
  examples: { token: 'token-from-the-email' },
});

export const resetPassword = noticeForm({
  operationId: 'resetPassword',
  path: '/passwords/{token}',
  summary: 'Set a new password with the token from the reset email. The visitor is not signed in by it.',
  body: s.object({ password: s.string(), passwordConfirmation: s.string() }),
  params: TOKEN_PARAM,
  formPage: '/passwords/{token}/edit',
  request: {
    path: '/passwords/{token}',
    body: { 'user[password]': '{password}', 'user[password_confirmation]': '{passwordConfirmation}' },
  },
  verb: 'PUT',
  landing: '/sessions/new',
  routes: ['PUT /passwords/:id', 'PATCH /passwords/:id', 'GET /passwords/:id/edit'],
  examples: {
    token: 'token-from-the-email',
    password: 'another long password',
    passwordConfirmation: 'another long password',
  },
});

export const reactivateAccount = noticeForm({
  operationId: 'reactivateAccount',
  path: '/reactivations/{token}',
  summary: 'Reactivate a deactivated account with the token from the email. Only Philomena has this.',
  body: s.object({}),
  params: TOKEN_PARAM,
  formPage: '/reactivations/{token}',
  request: { path: '/reactivations', body: { token: '{token}' } },
  flavors: ['philomena'],
  routes: ['POST /reactivations', 'GET /reactivations/:id'],
  examples: { token: 'token-from-the-email' },
});

export const changeName = noticeForm({
  operationId: 'changeName',
  path: '/registrations/name',
  summary: 'Change the signed-in visitor’s name. The site limits how often this may be done.',
  body: s.object({ name: s.string() }),
  formPage: '/registrations/name/edit',
  request: { path: '/registrations/name', body: { 'user[name]': '{name}' } },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: ['PUT /registrations/name', 'PATCH /registrations/name', 'GET /registrations/name/edit'],
  examples: { name: 'Pleb' },
});

export const changePassword = noticeForm({
  operationId: 'changePassword',
  path: '/registrations/password',
  summary: 'Change the signed-in visitor’s password. The site signs them in again afterwards.',
  body: s.object({ currentPassword: s.string(), password: s.string(), passwordConfirmation: s.string() }),
  formPage: '/registrations/edit',
  request: {
    path: '/registrations/password',
    body: {
      current_password: '{currentPassword}',
      'user[password]': '{password}',
      'user[password_confirmation]': '{passwordConfirmation}',
    },
  },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: ['PUT /registrations/password', 'PATCH /registrations/password'],
  examples: { currentPassword: 'philomena123', password: 'philomena123', passwordConfirmation: 'philomena123' },
});

export const requestEmailChange = noticeForm({
  operationId: 'requestEmailChange',
  path: '/registrations/email',
  summary:
    'Ask to change the signed-in visitor’s email. The change takes effect when they follow the link sent to the new address.',
  body: s.object({ currentPassword: s.string(), email: s.string() }),
  formPage: '/registrations/edit',
  request: {
    path: '/registrations/email',
    body: { current_password: '{currentPassword}', 'user[email]': '{email}' },
  },
  signedIn: true,
  follow: true,
  routes: ['POST /registrations/email'],
  examples: { currentPassword: 'philomena123', email: 'pleb.new@example.com' },
});

export const deactivateAccount = defineOperation({
  operationId: 'deactivateAccount',
  path: '/deactivations',
  method: 'delete',
  summary: 'Deactivate the signed-in visitor’s account and sign them out. Only Philomena has this.',
  tags: ['account'],
  response: s.ref('Session'),
  philomena: {
    routes: ['DELETE /deactivations', 'GET /deactivations'],
    auth: 'session',
    strategies: [
      {
        kind: 'form',
        flavors: ['philomena'],
        form: { page: '/deactivations', csrf: TOKEN },
        request: { method: 'DELETE', path: '/deactivations' },
        // The site signs the visitor out: the login link is back in the header.
        result: {
          page: '/',
          select: {
            fields: { ...sessionFields, _anonymous: { sel: 'a[href="/sessions/new"]', exists: true } },
          },
          must: ['/_anonymous'],
          errors: REJECTION,
        },
      },
    ],
  },
});

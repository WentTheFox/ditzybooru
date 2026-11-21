import type { FieldSpec } from '../dsl/extract.ts';
import type { Operation } from '../dsl/operation.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';

export const TOKEN = { sel: 'meta[name=csrf-token]', attr: 'content' };

/** Philomena says why a form was turned down in flash messages and inline errors. */
export const REJECTION = '.flash--warning, .flash--danger, .flash--error, .alert, .help-block';

interface NoticeForm {
  /** Our verb; the default is `post`. */
  method?: 'post' | 'put' | 'delete';
  /** Tags of the operation. */
  group?: string;
  /** Fields to read besides the message, from the page the submission leads to. */
  extraFields?: Record<string, FieldSpec>;
  /** The response schema, when it is more than a `Notice`. */
  response?: string;
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
  verb?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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
export function noticeForm(options: NoticeForm) {
  return defineOperation({
    operationId: options.operationId,
    path: options.path,
    method: options.method ?? 'post',
    summary: options.summary,
    tags: [options.group ?? 'account'],
    ...(options.params ? { params: options.params } : {}),
    body: options.body,
    response: s.ref(options.response ?? 'Notice'),
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
                ...options.extraFields,
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

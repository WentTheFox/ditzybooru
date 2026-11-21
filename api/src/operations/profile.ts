import { s } from '../dsl/schema.ts';
import { noticeForm } from './forms.ts';

const slug = [{ name: 'slug', in: 'path' as const, schema: s.string(), required: true }];

export const createConversation = noticeForm({
  operationId: 'createConversation',
  group: 'inbox',
  path: '/conversations',
  summary: 'Start a private conversation with another user.',
  body: s.object({ recipient: s.string(), title: s.string(), body: s.string() }),
  formPage: '/conversations/new',
  request: {
    path: '/conversations',
    body: {
      'conversation[recipient]': '{recipient}',
      'conversation[title]': '{title}',
      'conversation[messages][0][body]': '{body}',
    },
  },
  signedIn: true,
  follow: true,
  routes: ['POST /conversations', 'GET /conversations/new'],
  examples: { recipient: 'Administrator', title: 'Verifier chat', body: 'Hello from the verifier.' },
});

export const sendMessage = noticeForm({
  operationId: 'sendMessage',
  group: 'inbox',
  path: '/conversations/{slug}/messages',
  summary: 'Reply in a private conversation.',
  params: slug,
  body: s.object({ body: s.string() }),
  formPage: '/conversations/{slug}',
  request: { path: '/conversations/{slug}/messages', body: { 'message[body]': '{body}' } },
  signedIn: true,
  follow: true,
  routes: ['POST /conversations/:conversation_id/messages'],
  examples: { slug: 'verification-chat', body: 'A reply from the verifier.' },
});

export const updateDescription = noticeForm({
  operationId: 'updateDescription',
  group: 'profiles',
  method: 'put',
  path: '/profiles/{slug}/description',
  summary: 'Change the about text and title of the visitor’s own profile.',
  params: slug,
  body: s.object({ description: s.optional(s.string()), personalTitle: s.optional(s.string()) }),
  formPage: '/profiles/{slug}/description/edit',
  request: {
    path: '/profiles/{slug}/description',
    body: { 'user[description]': '{description}', 'user[personal_title]': '{personalTitle}' },
  },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: [
    'PUT /profiles/:profile_id/description',
    'PATCH /profiles/:profile_id/description',
    'GET /profiles/:profile_id/description/edit',
  ],
  examples: { slug: 'Pleb', description: 'The dev user.', personalTitle: 'Dev' },
});

export const updateAvatar = noticeForm({
  operationId: 'updateAvatar',
  group: 'profiles',
  method: 'put',
  path: '/avatar',
  summary: 'Set the visitor’s avatar from an image the site fetches from a URL. A file upload is not mapped yet.',
  body: s.object({ url: s.uri() }),
  formPage: '/avatar/edit',
  request: { path: '/avatar', body: { 'user[scraper_url]': '', scraper_cache: '{url}' } },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: ['PUT /avatar', 'PATCH /avatar', 'GET /avatar/edit'],
  examples: { url: 'http://host.containers.internal:8099/verify.png' },
});

export const deleteAvatar = noticeForm({
  operationId: 'deleteAvatar',
  group: 'profiles',
  method: 'delete',
  path: '/avatar',
  summary: 'Remove the visitor’s avatar.',
  body: s.object({}),
  formPage: '/avatar/edit',
  request: { path: '/avatar', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /avatar'],
  examples: {},
});

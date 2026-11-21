import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { noticeForm, REJECTION, TOKEN } from './forms.ts';

const BOTH = ['philomena', 'furbooru'];
const filterPath = [{ name: 'id', in: 'path' as const, schema: s.int(), required: true }];

const filterBody = {
  name: s.string(),
  description: s.optional(s.string()),
  spoileredTags: s.optional(s.string()),
  hiddenTags: s.optional(s.string()),
  spoileredComplex: s.optional(s.string()),
  hiddenComplex: s.optional(s.string()),
};

const filterFields = {
  'filter[name]': '{name}',
  'filter[description]': '{description}',
  'filter[spoilered_tag_list]': '{spoileredTags}',
  'filter[hidden_tag_list]': '{hiddenTags}',
  'filter[spoilered_complex_str]': '{spoileredComplex}',
  'filter[hidden_complex_str]': '{hiddenComplex}',
};

const filterId: FieldSpec = { sel: 'a.button[href$="/edit"]', attr: 'href', as: 'lastInt', optional: true };

export const createFilter = noticeForm({
  operationId: 'createFilter',
  group: 'filters',
  path: '/filters',
  summary: 'Create a filter. Answers the site’s message and the new filter’s id.',
  body: s.object({ ...filterBody, public: s.optional(s.bool()) }),
  formPage: '/filters/new',
  request: { path: '/filters', body: { ...filterFields, 'filter[public]': '{public}' } },
  signedIn: true,
  follow: true,
  extraFields: { id: filterId },
  response: 'FilterSaved',
  routes: ['POST /filters', 'GET /filters/new'],
  examples: {
    name: 'Verify filter',
    description: 'made by the verifier',
    spoileredTags: 'spoiler',
    hiddenTags: 'hidden',
  },
});

export const updateFilter = noticeForm({
  operationId: 'updateFilter',
  group: 'filters',
  method: 'put',
  path: '/filters/{id}',
  summary: 'Change one of the visitor’s own filters.',
  params: filterPath,
  body: s.object(filterBody),
  formPage: '/filters/{id}/edit',
  request: { path: '/filters/{id}', body: filterFields },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  extraFields: { id: filterId },
  response: 'FilterSaved',
  routes: ['PUT /filters/:id', 'PATCH /filters/:id', 'GET /filters/:id/edit'],
  examples: { id: 3, name: 'My dev filter', description: 'A filter of the dev user’s own.' },
});

export const deleteFilter = noticeForm({
  operationId: 'deleteFilter',
  group: 'filters',
  method: 'delete',
  path: '/filters/{id}',
  summary: 'Delete one of the visitor’s own filters, when nothing uses it.',
  params: filterPath,
  body: s.object({}),
  formPage: '/filters/{id}',
  request: { path: '/filters/{id}', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /filters/:id'],
  examples: { id: 9999 },
});

export const setCurrentFilter = noticeForm({
  operationId: 'setCurrentFilter',
  group: 'filters',
  method: 'put',
  path: '/filters/{id}/current',
  summary: 'Switch to a filter.',
  params: filterPath,
  body: s.object({}),
  formPage: '/filters/{id}',
  request: { path: '/filters/current?id={id}', body: {} },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: ['PUT /filters/current', 'PATCH /filters/current'],
  examples: { id: 3 },
});

export const makeFilterPublic = noticeForm({
  operationId: 'makeFilterPublic',
  group: 'filters',
  path: '/filters/{id}/public',
  summary: 'Make one of the visitor’s filters public. It cannot be made private again.',
  params: filterPath,
  body: s.object({}),
  formPage: '/filters/{id}',
  request: { path: '/filters/{id}/public', body: {} },
  signedIn: true,
  follow: true,
  routes: ['POST /filters/:filter_id/public'],
  examples: { id: 3 },
});

export const clearRecentFilters = noticeForm({
  operationId: 'clearRecentFilters',
  group: 'filters',
  method: 'delete',
  path: '/filters/recent',
  summary: 'Clear the list of recently used filters.',
  body: s.object({}),
  formPage: '/filters',
  request: { path: '/filters/clear_recent', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /filters/clear_recent'],
  examples: {},
});

export const setSpoilerType = defineOperation({
  operationId: 'setSpoilerType',
  path: '/filters/spoiler_type',
  method: 'put',
  summary: 'Choose how spoilered images show: `static`, `click`, `hover` or `off`.',
  tags: ['filters'],
  body: s.object({ spoilerType: s.enum('static', 'click', 'hover', 'off') }),
  response: s.ref('Notice'),
  examples: { spoilerType: 'static' },
  philomena: {
    routes: ['PUT /filters/spoiler_type', 'PATCH /filters/spoiler_type'],
    auth: 'session',
    strategies: ['philomena', 'furbooru'].map(flavor => ({
      kind: 'form' as const,
      flavors: [flavor],
      form: { page: '/filters', csrf: TOKEN },
      // Furbooru keeps the setting on the user, Philomena in the user's settings.
      request: {
        method: 'PUT' as const,
        path: '/filters/spoiler_type',
        body: { [flavor === 'philomena' ? 'settings[spoiler_type]' : 'user[spoiler_type]']: '{spoilerType}' },
      },
      result: {
        page: '/',
        follow: true as const,
        select: {
          fields: {
            message: { sel: '.flash--success', text: true, optional: true },
            _took: { sel: '.flash--success', exists: true },
          },
        },
        must: ['/_took'],
        errors: REJECTION,
      },
    })),
  },
});

/** Hide or spoiler one tag in the visitor's current filter. The site answers an empty 200. */
function filterTag(options: { operationId: string; what: 'hide' | 'spoiler'; on: boolean }) {
  const verb = options.on ? 'POST' : 'DELETE';
  return defineOperation({
    operationId: options.operationId,
    path: `/filters/${options.what}`,
    method: options.on ? 'post' : 'delete',
    summary: `${options.on ? 'Add a tag to' : 'Remove a tag from'} the ${options.what === 'hide' ? 'hidden' : 'spoilered'} tags of the visitor’s current filter.`,
    tags: ['filters'],
    body: s.object({ tag: s.string() }),
    response: s.ref('Done'),
    examples: { tag: 'safe' },
    philomena: {
      routes: [`${verb} /filters/${options.what}`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/', csrf: TOKEN },
          request: { method: verb, path: `/filters/${options.what}`, body: { tag: '{tag}' } },
          result: { page: '', answer: true, select: { fields: {} } },
        },
      ],
    },
  });
}

export const hideTag = filterTag({ operationId: 'hideTag', what: 'hide', on: true });
export const unhideTag = filterTag({ operationId: 'unhideTag', what: 'hide', on: false });
export const spoilerTag = filterTag({ operationId: 'spoilerTag', what: 'spoiler', on: true });
export const unspoilerTag = filterTag({ operationId: 'unspoilerTag', what: 'spoiler', on: false });

function tagWatch(on: boolean) {
  const verb = on ? 'POST' : 'DELETE';
  return defineOperation({
    operationId: on ? 'watchTag' : 'unwatchTag',
    path: '/tags/{slug}/watch',
    method: on ? 'post' : 'delete',
    summary: on ? 'Watch a tag: its new images show on the watched page.' : 'Stop watching a tag.',
    tags: ['tags'],
    params: [{ name: 'slug', in: 'path', schema: s.string(), required: true }],
    response: s.ref('Done'),
    examples: { slug: 'safe' },
    philomena: {
      routes: [`${verb} /tags/:tag_id/watch`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/', csrf: TOKEN },
          request: { method: verb, path: '/tags/{slug}/watch' },
          result: { page: '', answer: true, select: { fields: {} } },
        },
      ],
    },
  });
}

export const watchTag = tagWatch(true);
export const unwatchTag = tagWatch(false);

const conversationPath = [{ name: 'slug', in: 'path' as const, schema: s.string(), required: true }];

function conversationAction(options: { operationId: string; what: 'hide' | 'read'; on: boolean; summary: string }) {
  const verb = options.on ? 'POST' : 'DELETE';
  return noticeForm({
    operationId: options.operationId,
    group: 'inbox',
    method: options.on ? 'post' : 'delete',
    path: `/conversations/{slug}/${options.what}`,
    summary: options.summary,
    params: conversationPath,
    body: s.object({}),
    formPage: '/conversations/{slug}',
    request: { path: `/conversations/{slug}/${options.what}`, body: {} },
    verb,
    signedIn: true,
    follow: true,
    routes: [`${verb} /conversations/:conversation_id/${options.what}`],
    examples: { slug: 'verification-chat' },
  });
}

export const hideConversation = conversationAction({
  operationId: 'hideConversation',
  what: 'hide',
  on: true,
  summary: 'Hide a conversation from the visitor’s list.',
});
export const restoreConversation = conversationAction({
  operationId: 'restoreConversation',
  what: 'hide',
  on: false,
  summary: 'Bring a hidden conversation back.',
});
export const markConversationRead = conversationAction({
  operationId: 'markConversationRead',
  what: 'read',
  on: true,
  summary: 'Mark a conversation as read.',
});
export const markConversationUnread = conversationAction({
  operationId: 'markConversationUnread',
  what: 'read',
  on: false,
  summary: 'Mark a conversation as unread.',
});

function nsfwChannels(on: boolean) {
  return noticeForm({
    operationId: on ? 'showNsfwChannels' : 'hideNsfwChannels',
    group: 'channels',
    method: on ? 'post' : 'delete',
    path: '/channels/nsfw',
    summary: on ? 'Show NSFW livestream channels in the list.' : 'Hide NSFW livestream channels from the list.',
    body: s.object({}),
    formPage: '/channels',
    request: { path: '/channels/nsfw', body: {} },
    verb: on ? 'POST' : 'DELETE',
    signedIn: true,
    follow: true,
    routes: [`${on ? 'POST' : 'DELETE'} /channels/nsfw`],
    examples: {},
  });
}

export const showNsfwChannels = nsfwChannels(true);
export const hideNsfwChannels = nsfwChannels(false);

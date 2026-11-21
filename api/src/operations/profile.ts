import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { noticeForm, REJECTION, TOKEN } from './forms.ts';

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

/** Settings Philomena keeps on the user itself. Furbooru keeps all of them there. */
const onUser = {
  autocompleteSearchHistoryHidden: 'autocomplete_search_history_hidden',
  autocompletePropertiesHidden: 'autocomplete_properties_hidden',
  autocompleteSearchHistoryMaxSuggestionsWhenTyping: 'autocomplete_search_history_max_suggestions_when_typing',
  chanNsfw: 'chan_nsfw',
  enableSearchAc: 'enable_search_ac',
  hideScore: 'hide_score',
  hideUploader: 'hide_uploader',
  hidpi: 'hidpi',
  serveWebm: 'serve_webm',
  unfilterTagSuggestions: 'unfilter_tag_suggestions',
  unmuteVideos: 'unmute_videos',
  watchedTagList: 'watched_tag_list',
  subscribeUrl: 'subscribe_url',
  webm: 'webm',
} as const;

/** Settings Philomena keeps in the user's settings record. */
const inSettings = {
  anonymousByDefault: 'anonymous_by_default',
  borderlessTags: 'borderless_tags',
  commentsAlwaysJumpToLast: 'comments_always_jump_to_last',
  commentsNewestFirst: 'comments_newest_first',
  commentsPerPage: 'comments_per_page',
  delayHomeImages: 'delay_home_images',
  fancyTagFieldOnEdit: 'fancy_tag_field_on_edit',
  fancyTagFieldOnUpload: 'fancy_tag_field_on_upload',
  hideVoteCounts: 'hide_vote_counts',
  imagesPerPage: 'images_per_page',
  messagesNewestFirst: 'messages_newest_first',
  noSpoileredInWatched: 'no_spoilered_in_watched',
  roundedTags: 'rounded_tags',
  scaleLargeImages: 'scale_large_images',
  showSidebarAndWatchedImages: 'show_sidebar_and_watched_images',
  themeColor: 'theme_color',
  themeName: 'theme_name',
  useCenteredLayout: 'use_centered_layout',
  watchOnNewTopic: 'watch_on_new_topic',
  watchOnReply: 'watch_on_reply',
  watchOnUpload: 'watch_on_upload',
  watchedImagesExcludeStr: 'watched_images_exclude_str',
  watchedImagesQueryStr: 'watched_images_query_str',
} as const;

const flags = new Set([
  'autocompleteSearchHistoryHidden',
  'autocompletePropertiesHidden',
  'chanNsfw',
  'enableSearchAc',
  'hideScore',
  'hideUploader',
  'hidpi',
  'serveWebm',
  'unfilterTagSuggestions',
  'unmuteVideos',
  'webm',
  'anonymousByDefault',
  'borderlessTags',
  'commentsAlwaysJumpToLast',
  'commentsNewestFirst',
  'delayHomeImages',
  'fancyTagFieldOnEdit',
  'fancyTagFieldOnUpload',
  'hideVoteCounts',
  'messagesNewestFirst',
  'noSpoileredInWatched',
  'roundedTags',
  'showSidebarAndWatchedImages',
  'useCenteredLayout',
  'watchOnNewTopic',
  'watchOnReply',
  'watchOnUpload',
]);

const numbers = new Set(['autocompleteSearchHistoryMaxSuggestionsWhenTyping', 'commentsPerPage', 'imagesPerPage']);

const settingFields = { ...onUser, ...inSettings };

export const updateSettings = defineOperation({
  operationId: 'updateSettings',
  path: '/settings',
  method: 'patch',
  summary: 'Change the visitor’s settings. Only the fields given change; the site’s own names, in camelCase.',
  tags: ['account'],
  body: s.object(
    Object.fromEntries(
      Object.keys(settingFields).map(name => [
        name,
        flags.has(name) ? s.optional(s.bool()) : numbers.has(name) ? s.optional(s.int()) : s.optional(s.string()),
      ]),
    ),
  ),
  response: s.ref('Notice'),
  examples: { imagesPerPage: 15 },
  philomena: {
    routes: ['PATCH /settings', 'PUT /settings', 'GET /settings/edit'],
    auth: 'session',
    strategies: ['philomena', 'furbooru'].map(flavor => ({
      kind: 'form' as const,
      flavors: [flavor],
      form: { page: '/settings/edit', csrf: TOKEN },
      request: {
        method: 'PATCH' as const,
        path: '/settings',
        body: Object.fromEntries(
          Object.entries(settingFields).map(([name, upstream]) => [
            flavor === 'philomena' && name in inSettings ? `user[settings][${upstream}]` : `user[${upstream}]`,
            `{${name}}`,
          ]),
        ),
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

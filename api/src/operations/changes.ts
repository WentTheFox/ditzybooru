import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';

const BOTH = ['philomena', 'furbooru'];
const NEXT: FieldSpec = { sel: 'nav.pagination a.js-next', exists: true };

interface ChangeOptions {
  operationId: string;
  /** Our path. */
  path: string;
  /** The upstream's path, with the same `{param}` placeholders. */
  upstream: string;
  route: string;
  summary: string;
  params: { name: string; example: string | number }[];
  /** Flavors that have the page. */
  flavors?: string[];
}

function pathParams(options: ChangeOptions) {
  return options.params.map(({ name }) => ({ name, in: 'path' as const, schema: s.string(), required: true }));
}

/** A page of the source changes of an image or a user, one table row each. */
function sourceChanges(options: ChangeOptions) {
  return defineOperation({
    operationId: options.operationId,
    path: options.path,
    method: 'get',
    summary: options.summary,
    tags: ['changes'],
    params: [...pathParams(options), { name: 'page', in: 'query', schema: s.int() }],
    response: s.ref('SourceChangeList'),
    examples: Object.fromEntries(options.params.map(({ name, example }) => [name, example])),
    philomena: {
      routes: [options.route],
      auth: 'none',
      strategies: [
        {
          kind: 'html',
          flavors: options.flavors ?? BOTH,
          request: { method: 'GET', path: options.upstream, query: { page: '{page|1}' } },
          template: 'lib/philomena_web/templates/source_change/index.html.slime',
          select: {
            fields: {
              items: {
                sel: 'table.table tbody tr',
                many: true,
                fields: {
                  imageId: { sel: 'td:nth-child(1) a', text: true, as: 'int' },
                  sourceUrl: { sel: 'td:nth-child(3)', text: true },
                  added: { sel: 'td.success', exists: true },
                  createdAt: { sel: 'td:nth-child(5) time', attr: 'datetime' },
                  user: { sel: 'td:nth-child(6) strong', text: true },
                },
              },
              hasNext: NEXT,
            },
          },
        },
      ],
    },
  });
}

/** A page of tag changes: who changed which tags of an image, and when. */
function tagChanges(options: ChangeOptions) {
  return defineOperation({
    operationId: options.operationId,
    path: options.path,
    method: 'get',
    summary: options.summary,
    tags: ['changes'],
    params: [
      ...pathParams(options),
      { name: 'page', in: 'query', schema: s.int() },
      { name: 'tcq', in: 'query', schema: s.string(), description: 'Tag change search, e.g. `added_tag:safe`.' },
    ],
    response: s.ref('TagChangeList'),
    examples: Object.fromEntries(options.params.map(({ name, example }) => [name, example])),
    philomena: {
      routes: [options.route],
      auth: 'none',
      strategies: [
        {
          kind: 'html',
          flavors: options.flavors ?? BOTH,
          request: { method: 'GET', path: options.upstream, query: { page: '{page|1}', tcq: '{tcq}' } },
          template: 'lib/philomena_web/templates/tag_change/index.html.slime',
          select: {
            fields: {
              items: {
                sel: '.tag__change-block',
                many: true,
                fields: {
                  // The page of one image leaves its thumbnail out.
                  imageId: {
                    sel: '.tag__change-image .image-container',
                    attr: 'data-image-id',
                    as: 'int',
                    optional: true,
                  },
                  user: { sel: '.tag__change-info strong', text: true },
                  createdAt: { sel: '.tag__change-info time', attr: 'datetime' },
                  staff: { sel: '.tag__change-info .label--success', exists: true },
                  added: { sel: '.tag__change-tags .added .tag__name', text: true, many: true, optional: true },
                  removed: { sel: '.tag__change-tags .removed .tag__name', text: true, many: true, optional: true },
                },
              },
              hasNext: NEXT,
            },
          },
        },
      ],
    },
  });
}

export const listImageSourceChanges = sourceChanges({
  operationId: 'listImageSourceChanges',
  path: '/images/{imageId}/source_changes',
  upstream: '/images/{imageId}/source_changes',
  route: 'GET /images/:image_id/source_changes',
  summary: 'The source changes of one image, newest first.',
  params: [{ name: 'imageId', example: 1 }],
});

export const listProfileSourceChanges = sourceChanges({
  operationId: 'listProfileSourceChanges',
  path: '/profiles/{slug}/source_changes',
  upstream: '/profiles/{slug}/source_changes',
  route: 'GET /profiles/:profile_id/source_changes',
  summary: 'The source changes a user made, newest first.',
  params: [{ name: 'slug', example: 'Pleb' }],
});

export const listImageTagChanges = tagChanges({
  operationId: 'listImageTagChanges',
  path: '/images/{imageId}/tag_changes',
  upstream: '/images/{imageId}/tag_changes',
  route: 'GET /images/:image_id/tag_changes',
  summary: 'The tag changes of one image, newest first.',
  params: [{ name: 'imageId', example: 1 }],
});

export const listProfileTagChanges = tagChanges({
  operationId: 'listProfileTagChanges',
  path: '/profiles/{slug}/tag_changes',
  upstream: '/profiles/{slug}/tag_changes',
  route: 'GET /profiles/:profile_id/tag_changes',
  summary: 'The tag changes a user made, newest first.',
  params: [{ name: 'slug', example: 'Pleb' }],
});

export const listTagTagChanges = tagChanges({
  operationId: 'listTagTagChanges',
  path: '/tags/{slug}/tag_changes',
  upstream: '/tags/{slug}/tag_changes',
  route: 'GET /tags/:tag_id/tag_changes',
  summary: 'The changes that added or removed one tag, newest first.',
  params: [{ name: 'slug', example: 'safe' }],
});

export const listTagChanges = tagChanges({
  operationId: 'listTagChanges',
  path: '/tag_changes',
  upstream: '/tag_changes',
  route: 'GET /tag_changes',
  summary: 'Every tag change on the site, newest first. Only Philomena has this page.',
  params: [],
  flavors: ['philomena'],
});

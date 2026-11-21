import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { representationFields } from './media.ts';

const BOTH = ['philomena', 'furbooru'];
const NEXT: FieldSpec = { sel: 'nav.pagination a.js-next', exists: true };

/** The edit history of a comment or a forum post: the last 25 versions as the site renders their diffs. */
function editHistory(options: {
  operationId: string;
  path: string;
  upstream: string;
  route: string;
  summary: string;
  params: { name: string; schema: ReturnType<typeof s.int> | ReturnType<typeof s.string>; example: string | number }[];
  template: string;
}) {
  return defineOperation({
    operationId: options.operationId,
    path: options.path,
    method: 'get',
    summary: options.summary,
    tags: ['history'],
    params: options.params.map(({ name, schema }) => ({ name, in: 'path' as const, schema, required: true })),
    response: s.ref('EditHistory'),
    examples: Object.fromEntries(options.params.map(({ name, example }) => [name, example])),
    philomena: {
      routes: [options.route],
      auth: 'none',
      strategies: [
        {
          kind: 'html',
          flavors: BOTH,
          request: { method: 'GET', path: options.upstream },
          template: options.template,
          select: {
            fields: {
              author: { sel: 'h1 strong', text: true },
              items: {
                sel: 'article.communication',
                many: true,
                fields: {
                  // `<ins>` and `<del>` mark what the edit added and removed.
                  diffHtml: { sel: '.communication__body__text', html: true, as: 'sanitizedHtml' },
                  reason: { sel: '.communication__options .flex--spaced-out > div:first-child', text: true },
                  editedAt: { sel: '.flex__right time', attr: 'datetime' },
                  editor: { sel: '.flex__right strong', text: true },
                },
              },
            },
          },
        },
      ],
    },
  });
}

export const listCommentHistory = editHistory({
  operationId: 'listCommentHistory',
  path: '/images/{imageId}/comments/{commentId}/history',
  upstream: '/images/{imageId}/comments/{commentId}/history',
  route: 'GET /images/:image_id/comments/:comment_id/history',
  summary: 'The last 25 versions of a comment, each as a diff against the one before.',
  params: [
    { name: 'imageId', schema: s.int(), example: 1 },
    { name: 'commentId', schema: s.int(), example: 1 },
  ],
  template: 'lib/philomena_web/templates/image/comment/history/index.html.slime',
});

export const listPostHistory = editHistory({
  operationId: 'listPostHistory',
  path: '/forums/{forum}/topics/{topic}/posts/{postId}/history',
  upstream: '/forums/{forum}/topics/{topic}/posts/{postId}/history',
  route: 'GET /forums/:forum_id/topics/:topic_id/posts/:post_id/history',
  summary: 'The last 25 versions of a forum post, each as a diff against the one before.',
  params: [
    { name: 'forum', schema: s.string(), example: 'dis' },
    { name: 'topic', schema: s.string(), example: 'example-topic' },
    { name: 'postId', schema: s.int(), example: 1 },
  ],
  template: 'lib/philomena_web/templates/topic/post/history/index.html.slime',
});

export const listPageHistory = defineOperation({
  operationId: 'listPageHistory',
  path: '/pages/{slug}/history',
  method: 'get',
  summary: 'The revisions of a static page, each with the diff of its text.',
  tags: ['history'],
  params: [{ name: 'slug', in: 'path', schema: s.string(), required: true }],
  response: s.ref('PageHistory'),
  examples: { slug: 'about' },
  philomena: {
    routes: ['GET /pages/:page_id/history'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/pages/{slug}/history' },
        template: 'lib/philomena_web/templates/page/history/index.html.slime',
        select: {
          fields: {
            title: { sel: 'h1 a', text: true },
            items: {
              sel: 'table.table > tbody > tr',
              many: true,
              fields: {
                editor: { sel: 'td:nth-child(1)', text: true },
                editedAt: { sel: 'td:nth-child(2) time', attr: 'datetime' },
                diffHtml: { sel: 'td.static-page__diff', html: true, as: 'sanitizedHtml' },
              },
            },
          },
        },
      },
    ],
  },
});

export const listImageFavorites = defineOperation({
  operationId: 'listImageFavorites',
  path: '/images/{imageId}/favorites',
  method: 'get',
  summary: 'The users who faved an image, by name.',
  tags: ['images'],
  params: [{ name: 'imageId', in: 'path', schema: s.int(), required: true }],
  response: s.ref('ImageFavorites'),
  examples: { imageId: 1 },
  philomena: {
    routes: ['GET /images/:image_id/favorites'],
    auth: 'none',
    cacheSeconds: 30,
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/images/{imageId}/favorites' },
        template: 'lib/philomena_web/templates/image/favorite/index.html.slime',
        select: {
          fields: {
            // Moderators also get the up- and downvoters in the same list,
            // which this does not tell apart.
            users: {
              sel: 'a.interaction-user-list-item',
              many: true,
              optional: true,
              fields: {
                name: { text: true },
                slug: { attr: 'href', as: 'lastSegment' },
              },
            },
          },
        },
      },
    ],
  },
});

/** The image boxes of a page, each read from its container's data attributes. */
function imageBox(box: string): Record<string, FieldSpec> {
  const container = `${box} .image-container`.trim();
  const at = (attr: string, as?: FieldSpec['as']): FieldSpec => ({ sel: container, attr, ...(as ? { as } : {}) });
  return {
    id: at('data-image-id', 'int'),
    createdAt: at('data-created-at'),
    width: at('data-width', 'int'),
    height: at('data-height', 'int'),
    score: at('data-score', 'int'),
    upvotes: at('data-upvotes', 'int'),
    downvotes: at('data-downvotes', 'int'),
    faves: at('data-faves', 'int'),
    commentCount: at('data-comment-count', 'int'),
    representations: { sel: container, attr: 'data-uris', json: true, map: representationFields() },
  };
}

export const listRelatedImages = defineOperation({
  operationId: 'listRelatedImages',
  path: '/images/{imageId}/related',
  method: 'get',
  summary: 'Images the site finds similar to one image, as thumbnails.',
  tags: ['images'],
  params: [{ name: 'imageId', in: 'path', schema: s.int(), required: true }],
  response: s.ref('ImageBoxList'),
  examples: { imageId: 1 },
  philomena: {
    routes: ['GET /images/:image_id/related'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/images/{imageId}/related' },
        template: 'lib/philomena_web/templates/image/related/index.html.slime',
        select: {
          fields: {
            items: { sel: '#imagelist-container .media-box', many: true, optional: true, fields: imageBox('') },
          },
        },
      },
    ],
  },
});

export const listDuplicateReports = defineOperation({
  operationId: 'listDuplicateReports',
  path: '/duplicate_reports',
  method: 'get',
  summary: 'The duplicate reports: pairs of images where one is reported as a copy of the other.',
  tags: ['duplicates'],
  params: [{ name: 'page', in: 'query', schema: s.int() }],
  response: s.ref('DuplicateReportList'),
  examples: {},
  philomena: {
    routes: ['GET /duplicate_reports'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/duplicate_reports', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/duplicate_report/_duplicate_report.html.slime',
        select: {
          fields: {
            items: {
              sel: 'table.dupe-report-list > tbody > tr',
              many: true,
              fields: {
                id: { attr: 'class', as: 'lastInt' },
                imageId: { sel: '.dr__image-cell p:first-child', text: true, as: 'lastInt' },
                // The second cell is the image the first is reported to copy.
                duplicateOfImageId: {
                  sel: 'td:nth-child(2) .dr__image-cell p:first-child',
                  text: true,
                  as: 'lastInt',
                },
              },
            },
            hasNext: NEXT,
          },
        },
      },
    ],
  },
});

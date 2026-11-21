import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { noticeForm, TOKEN } from './forms.ts';

const BOTH = ['philomena', 'furbooru'];
const imagePath = [{ name: 'id', in: 'path' as const, schema: s.int(), required: true }];

/** An edit the site answers with the fragment its page swaps in: the form again, with an alert when it refused. */
function imageEdit(options: {
  operationId: string;
  what: 'tags' | 'sources' | 'description';
  summary: string;
  body: ReturnType<typeof s.object>;
  fields: Record<string, string>;
  /** Our response schema. */
  response: string;
  read: Record<string, FieldSpec>;
  examples: Record<string, string | number>;
  captcha?: true;
}) {
  return defineOperation({
    operationId: options.operationId,
    path: `/images/{id}/${options.what}`,
    method: 'put',
    summary: options.summary,
    tags: ['images'],
    params: imagePath,
    body: options.body,
    response: s.ref(options.response),
    examples: { id: 4, ...options.examples },
    philomena: {
      routes: [`PUT /images/:image_id/${options.what}`, `PATCH /images/:image_id/${options.what}`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/images/{id}', csrf: TOKEN },
          request: {
            method: 'PUT',
            path: `/images/{id}/${options.what}`,
            body: { ...options.fields, ...(options.captcha ? { 'h-captcha-response': '{captchaToken}' } : {}) },
          },
          result: {
            page: '',
            answer: true,
            select: { fields: { ...options.read, _failed: { sel: '.alert', exists: true } } },
            must: ['!/_failed'],
            errors: '.alert, .help-block',
          },
        },
      ],
    },
  });
}

export const updateImageTags = imageEdit({
  operationId: 'updateImageTags',
  what: 'tags',
  summary:
    'Change an image’s tags. Send the tags as the image page shows them (`previousTags`) and the new list, comma separated; the site works out what changed.',
  body: s.object({ tags: s.string(), previousTags: s.string(), captchaToken: s.optional(s.string()) }),
  fields: { 'image[tag_input]': '{tags}', 'image[old_tag_input]': '{previousTags}' },
  response: 'ImageTags',
  read: { tags: { sel: '.tag__name', text: true, many: true, optional: true } },
  examples: { tags: 'safe, verifier tag', previousTags: 'safe' },
  captcha: true,
});

export const updateImageSources = imageEdit({
  operationId: 'updateImageSources',
  what: 'sources',
  summary:
    'Change an image’s source URLs. Send the current list (`previousSources`) and the new one, as lists of URLs.',
  body: s.object({
    sources: s.array(s.string()),
    previousSources: s.array(s.string()),
    captchaToken: s.optional(s.string()),
  }),
  fields: { 'image[sources][*][source]': '{sources}', 'image[old_sources][*][source]': '{previousSources}' },
  response: 'ImageSources',
  read: { sources: { sel: 'input.js-source-url', attr: 'value', many: true, optional: true } },
  examples: { sources: '["https://example.com/verifier"]', previousSources: '[]' },
  captcha: true,
});

export const updateImageDescription = imageEdit({
  operationId: 'updateImageDescription',
  what: 'description',
  summary: 'Change an image’s description.',
  body: s.object({ description: s.string() }),
  fields: { 'image[description]': '{description}' },
  response: 'ImageDescription',
  read: { bodyHtml: { sel: '.block__content p', html: true, as: 'sanitizedHtml', optional: true } },
  examples: { description: 'Described by the verifier.' },
});

const uploaded: FieldSpec = { sel: '.image-show-container', attr: 'data-image-id', as: 'int', optional: true };

export const uploadImage = noticeForm({
  operationId: 'uploadImage',
  group: 'images',
  path: '/uploads',
  summary:
    'Upload an image the site fetches from a URL, as the visitor. Answers the new image’s id. A file upload is not mapped yet.',
  body: s.object({
    url: s.uri(),
    tags: s.string(),
    sources: s.optional(s.array(s.string())),
    description: s.optional(s.string()),
    captchaToken: s.optional(s.string()),
  }),
  formPage: '/images/new',
  request: {
    path: '/images',
    body: {
      scraper_cache: '{url}',
      'image[scraper_url]': '',
      'image[tag_input]': '{tags}',
      'image[sources][*][source]': '{sources}',
      'image[description]': '{description}',
      'h-captcha-response': '{captchaToken}',
    },
  },
  signedIn: true,
  follow: true,
  extraFields: { id: uploaded },
  response: 'ImageUploaded',
  routes: ['POST /images', 'GET /images/new'],
  examples: {
    url: 'http://host.containers.internal:8099/verify.png',
    tags: 'safe, verify upload, upload test, noise, generated',
    sources: '["https://example.com/verifier"]',
  },
});

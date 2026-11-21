import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { noticeForm, TOKEN } from './forms.ts';

const BOTH = ['philomena', 'furbooru'];
const galleryPath = [{ name: 'id', in: 'path' as const, schema: s.int(), required: true }];

const galleryBody = {
  title: s.string(),
  spoilerWarning: s.optional(s.string()),
  description: s.optional(s.string()),
  /** An image of the gallery to show as its cover. */
  thumbnailId: s.optional(s.int()),
  /** Insert new images at the end instead of the start. */
  reverseOrder: s.optional(s.bool()),
  anonymous: s.optional(s.bool()),
};

const galleryFields = {
  'gallery[title]': '{title}',
  'gallery[spoiler_warning]': '{spoilerWarning}',
  'gallery[description]': '{description}',
  'gallery[thumbnail_id]': '{thumbnailId}',
  'gallery[order_position_asc]': '{reverseOrder|false}',
  'gallery[anonymous]': '{anonymous|false}',
};

const galleryId: FieldSpec = { sel: 'a[href$="/edit"]', attr: 'href', as: 'lastInt', optional: true };

export const createGallery = noticeForm({
  operationId: 'createGallery',
  group: 'galleries',
  path: '/galleries',
  summary: 'Create a gallery. Answers the site’s message and the new gallery’s id.',
  body: s.object(galleryBody),
  formPage: '/galleries/new',
  request: { path: '/galleries', body: galleryFields },
  signedIn: true,
  follow: true,
  extraFields: { id: galleryId },
  response: 'GallerySaved',
  routes: ['POST /galleries', 'GET /galleries/new'],
  examples: { title: 'Verifier gallery', thumbnailId: 1, description: 'Made by the verifier.' },
});

export const updateGallery = noticeForm({
  operationId: 'updateGallery',
  group: 'galleries',
  method: 'put',
  path: '/galleries/{id}',
  summary: 'Change one of the visitor’s own galleries.',
  params: galleryPath,
  body: s.object(galleryBody),
  formPage: '/galleries/{id}/edit',
  request: { path: '/galleries/{id}', body: galleryFields },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  extraFields: { id: galleryId },
  response: 'GallerySaved',
  routes: ['PUT /galleries/:id', 'PATCH /galleries/:id', 'GET /galleries/:id/edit'],
  examples: { id: 3, title: 'Verifier gallery', thumbnailId: 1, description: 'Edited by the verifier.' },
});

export const deleteGallery = noticeForm({
  operationId: 'deleteGallery',
  group: 'galleries',
  method: 'delete',
  path: '/galleries/{id}',
  summary: 'Delete one of the visitor’s own galleries.',
  params: galleryPath,
  body: s.object({}),
  formPage: '/galleries/{id}',
  request: { path: '/galleries/{id}', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /galleries/:id'],
  examples: { id: 9999 },
});

/** Add an image to a gallery or take it out. The site's scripts send JSON and read an empty object. */
function galleryImage(on: boolean) {
  const verb = on ? 'POST' : 'DELETE';
  return defineOperation({
    operationId: on ? 'addGalleryImage' : 'removeGalleryImage',
    path: '/galleries/{id}/images',
    method: on ? 'post' : 'delete',
    summary: on
      ? 'Add an image to one of the visitor’s galleries.'
      : 'Take an image out of one of the visitor’s galleries.',
    tags: ['galleries'],
    params: galleryPath,
    body: s.object({ imageId: s.int() }),
    response: s.ref('Done'),
    examples: { id: 3, imageId: 2 },
    philomena: {
      routes: [`${verb} /galleries/:gallery_id/images`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/', csrf: TOKEN },
          request: { method: verb, path: '/galleries/{id}/images', encoding: 'json', body: { image_id: '{imageId}' } },
          result: { json: {} },
        },
      ],
    },
  });
}

export const addGalleryImage = galleryImage(true);
export const removeGalleryImage = galleryImage(false);

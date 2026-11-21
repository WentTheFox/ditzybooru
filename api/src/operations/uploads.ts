import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { mediaFields } from './media.ts';

/**
 * Both of these go through the site's JSON API, which takes the visitor's key
 * and no session. The image is named by a URL the site fetches itself; a file
 * upload is the page's multipart form, which is not mapped yet.
 */

export const createImage = defineOperation({
  operationId: 'createImage',
  path: '/images',
  method: 'post',
  summary: 'Upload an image the site fetches from a URL. Answers the new image.',
  tags: ['images'],
  body: s.object({
    url: s.uri(),
    tags: s.string(),
    sourceUrl: s.optional(s.string()),
    description: s.optional(s.string()),
  }),
  response: s.ref('Media'),
  philomena: {
    routes: ['POST /api/v1/json/images'],
    auth: 'api-key',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'form',
        request: {
          method: 'POST',
          path: '/api/v1/json/images',
          body: {
            url: '{url}',
            'image[tag_input]': '{tags}',
            'image[source_url]': '{sourceUrl}',
            'image[description]': '{description}',
          },
        },
        result: { json: mediaFields('/image') },
      },
    ],
  },
});

export const reverseSearch = defineOperation({
  operationId: 'reverseSearch',
  path: '/search/reverse',
  method: 'post',
  summary: 'Find images that look like the one at a URL.',
  tags: ['images'],
  body: s.object({
    url: s.uri(),
    /** How different a match may be, `0` to `1`; the site's default is `0.25`. */
    distance: s.optional(s.number()),
    limit: s.optional(s.int()),
  }),
  response: s.ref('ReverseSearchResults'),
  philomena: {
    routes: ['POST /api/v1/json/search/reverse'],
    auth: 'api-key-optional',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'form',
        request: {
          method: 'POST',
          path: '/api/v1/json/search/reverse',
          body: { url: '{url}', distance: '{distance}', limit: '{limit}' },
        },
        result: { json: { total: '/total', items: { from: '/images', map: mediaFields() } } },
      },
    ],
  },
});

import type { FieldSpec } from '../dsl/extract.ts';
import { s } from '../dsl/schema.ts';
import { noticeForm } from './forms.ts';

const slug = { name: 'slug', in: 'path' as const, schema: s.string(), required: true };
const itemId = { name: 'itemId', in: 'path' as const, schema: s.int(), required: true };

const listingBody = s.object({
  information: s.string(),
  contact: s.string(),
  willCreate: s.optional(s.string()),
  willNotCreate: s.optional(s.string()),
  /** Comma separated, from the site's list: `Anthro`, `Comics`, `Original Characters` and so on. */
  categories: s.optional(s.string()),
  open: s.optional(s.bool()),
});

const listingFields = {
  'commission[information]': '{information}',
  'commission[contact]': '{contact}',
  'commission[will_create]': '{willCreate}',
  'commission[will_not_create]': '{willNotCreate}',
  'commission[categories][]': '{categories}',
  'commission[open]': '{open|true}',
};

const listingExamples = {
  slug: 'Pleb',
  information: 'Commissions are open.',
  contact: 'Message me on the site.',
  categories: 'Anthro,Comics',
};

export const createCommission = noticeForm({
  operationId: 'createCommission',
  group: 'commissions',
  path: '/profiles/{slug}/commission',
  summary: 'Create the visitor’s commission listing.',
  params: [slug],
  body: listingBody,
  formPage: '/profiles/{slug}/commission/new',
  request: { path: '/profiles/{slug}/commission', body: listingFields },
  signedIn: true,
  follow: true,
  routes: ['POST /profiles/:profile_id/commission', 'GET /profiles/:profile_id/commission/new'],
  examples: listingExamples,
});

export const updateCommission = noticeForm({
  operationId: 'updateCommission',
  group: 'commissions',
  method: 'put',
  path: '/profiles/{slug}/commission',
  summary: 'Change the visitor’s commission listing.',
  params: [slug],
  body: listingBody,
  formPage: '/profiles/{slug}/commission/edit',
  request: { path: '/profiles/{slug}/commission', body: listingFields },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: [
    'PUT /profiles/:profile_id/commission',
    'PATCH /profiles/:profile_id/commission',
    'GET /profiles/:profile_id/commission/edit',
  ],
  examples: listingExamples,
});

export const deleteCommission = noticeForm({
  operationId: 'deleteCommission',
  group: 'commissions',
  method: 'delete',
  path: '/profiles/{slug}/commission',
  summary: 'Delete the visitor’s commission listing.',
  params: [slug],
  body: s.object({}),
  formPage: '/profiles/{slug}/commission',
  request: { path: '/profiles/{slug}/commission', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /profiles/:profile_id/commission'],
  examples: { slug: 'Pleb' },
});

const itemBody = s.object({
  /** The kind of work, from the site's list. */
  itemType: s.string(),
  basePrice: s.number(),
  description: s.string(),
  exampleImageId: s.optional(s.int()),
  addOns: s.optional(s.string()),
});

const itemFields = {
  'item[item_type]': '{itemType}',
  'item[base_price]': '{basePrice}',
  'item[description]': '{description}',
  'item[example_image_id]': '{exampleImageId}',
  'item[add_ons]': '{addOns}',
};

const itemExamples = {
  slug: 'Pleb',
  itemType: 'Sketch',
  basePrice: 5,
  description: 'A small icon.',
  exampleImageId: 1,
};

export const addCommissionItem = noticeForm({
  operationId: 'addCommissionItem',
  group: 'commissions',
  path: '/profiles/{slug}/commission/items',
  summary: 'Add an item to the visitor’s commission listing.',
  params: [slug],
  body: itemBody,
  formPage: '/profiles/{slug}/commission/items/new',
  request: { path: '/profiles/{slug}/commission/items', body: itemFields },
  signedIn: true,
  follow: true,
  routes: ['POST /profiles/:profile_id/commission/items', 'GET /profiles/:profile_id/commission/items/new'],
  examples: itemExamples,
});

export const updateCommissionItem = noticeForm({
  operationId: 'updateCommissionItem',
  group: 'commissions',
  method: 'put',
  path: '/profiles/{slug}/commission/items/{itemId}',
  summary: 'Change an item of the visitor’s commission listing.',
  params: [slug, itemId],
  body: itemBody,
  formPage: '/profiles/{slug}/commission/items/{itemId}/edit',
  request: { path: '/profiles/{slug}/commission/items/{itemId}', body: itemFields },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: [
    'PUT /profiles/:profile_id/commission/items/:id',
    'PATCH /profiles/:profile_id/commission/items/:id',
    'GET /profiles/:profile_id/commission/items/:id/edit',
  ],
  examples: { ...itemExamples, itemId: 1 },
});

export const deleteCommissionItem = noticeForm({
  operationId: 'deleteCommissionItem',
  group: 'commissions',
  method: 'delete',
  path: '/profiles/{slug}/commission/items/{itemId}',
  summary: 'Remove an item from the visitor’s commission listing.',
  params: [slug, itemId],
  body: s.object({}),
  formPage: '/profiles/{slug}/commission',
  request: { path: '/profiles/{slug}/commission/items/{itemId}', body: {} },
  verb: 'DELETE',
  signedIn: true,
  follow: true,
  routes: ['DELETE /profiles/:profile_id/commission/items/:id'],
  examples: { slug: 'Pleb', itemId: 1 },
});

const artistLinkId: FieldSpec = { sel: 'a[href$="/edit"]', attr: 'href', as: 'lastInt', optional: true };

const artistLinkBody = s.object({
  /** The artist tag this link proves ownership of, e.g. `artist:someone`. */
  tagName: s.optional(s.string()),
  uri: s.uri(),
  /** Whether the link shows on the visitor's profile. */
  public: s.optional(s.bool()),
});

const artistLinkFields = {
  'artist_link[tag_name]': '{tagName}',
  'artist_link[uri]': '{uri}',
  'artist_link[public]': '{public|true}',
};

export const createArtistLink = noticeForm({
  operationId: 'createArtistLink',
  group: 'profiles',
  path: '/profiles/{slug}/artist_links',
  summary: 'Submit a link to the visitor’s art for the staff to verify as theirs. Answers the new link’s id.',
  params: [slug],
  body: artistLinkBody,
  formPage: '/profiles/{slug}/artist_links/new',
  request: { path: '/profiles/{slug}/artist_links', body: artistLinkFields },
  signedIn: true,
  follow: true,
  extraFields: { id: artistLinkId },
  response: 'ArtistLinkSaved',
  routes: ['POST /profiles/:profile_id/artist_links', 'GET /profiles/:profile_id/artist_links/new'],
  examples: { slug: 'Pleb', tagName: 'artist:assasinmonkey', uri: 'https://example.com/verifier' },
});

export const createDnpEntry = noticeForm({
  operationId: 'createDnpEntry',
  group: 'dnp',
  path: '/dnp',
  summary: 'Ask for a restriction on uploading an artist’s work. Needs a verified artist link.',
  body: s.object({
    tagId: s.int(),
    /** One of the site's restriction types, e.g. `No Edits`, `Artist Upload Only` or `Other`. */
    dnpType: s.string(),
    conditions: s.optional(s.string()),
    reason: s.string(),
    hideReason: s.optional(s.bool()),
  }),
  formPage: '/dnp/new',
  request: {
    path: '/dnp',
    body: {
      'dnp_entry[tag_id]': '{tagId}',
      'dnp_entry[dnp_type]': '{dnpType}',
      'dnp_entry[conditions]': '{conditions}',
      'dnp_entry[reason]': '{reason}',
      'dnp_entry[hide_reason]': '{hideReason|false}',
    },
  },
  signedIn: true,
  follow: true,
  routes: ['POST /dnp', 'GET /dnp/new'],
  examples: { tagId: 31, dnpType: 'No Edits', reason: 'Requested by the verifier.' },
});

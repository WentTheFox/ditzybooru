import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';

const BOTH = ['philomena', 'furbooru'];

/** The Do-Not-Post list: artists' restrictions on uploading their work. */
export const listDnpEntries = defineOperation({
  operationId: 'listDnpEntries',
  path: '/dnp',
  method: 'get',
  summary: 'The Do-Not-Post list: one page of listed artists with their restriction and conditions.',
  tags: ['dnp'],
  params: [{ name: 'page', in: 'query', schema: s.int() }],
  response: s.ref('DnpList'),
  examples: {},
  philomena: {
    routes: ['GET /dnp'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/dnp', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/dnp_entry/index.html.slime',
        select: {
          fields: {
            items: {
              sel: 'table.table tbody tr',
              many: true,
              fields: {
                id: { sel: 'a[href^="/dnp/"]', attr: 'href', as: 'lastInt' },
                tag: { sel: '.tag__name', text: true },
                tagSlug: { sel: '.tag', attr: 'data-tag-slug' },
                restriction: { sel: 'td:nth-child(2)', text: true },
                conditions: { sel: 'td:nth-child(3)', text: true },
              },
            },
            hasNext: { sel: 'nav.pagination a.js-next', exists: true },
          },
        },
      },
    ],
  },
});

/** One Do-Not-Post entry, as an anonymous visitor sees it. */
export const getDnpEntry = defineOperation({
  operationId: 'getDnpEntry',
  path: '/dnp/{id}',
  method: 'get',
  summary: 'A Do-Not-Post entry: its tag, restriction and conditions.',
  tags: ['dnp'],
  params: [{ name: 'id', in: 'path', schema: s.int(), required: true }],
  response: s.ref('DnpEntry'),
  examples: { id: 1 },
  philomena: {
    routes: ['GET /dnp/:id'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/dnp/{id}' },
        template: 'lib/philomena_web/templates/dnp_entry/show.html.slime',
        select: {
          fields: {
            createdAt: { sel: 'table.table tr:nth-child(1) time', attr: 'datetime' },
            tag: { sel: 'table.table .tag__name', text: true },
            tagSlug: { sel: 'table.table .tag', attr: 'data-tag-slug' },
            restriction: { sel: 'table.table tr:nth-child(3) td:nth-child(2)', text: true },
            conditions: { sel: 'table.table tr:nth-child(4) td:nth-child(2)', text: true },
          },
        },
      },
    ],
  },
});

/** The commissions directory: artists with open commission listings. */
export const listCommissions = defineOperation({
  operationId: 'listCommissions',
  path: '/commissions',
  method: 'get',
  summary: 'The commissions directory: one page of open listings.',
  tags: ['commissions'],
  params: [{ name: 'page', in: 'query', schema: s.int() }],
  response: s.ref('CommissionList'),
  examples: {},
  philomena: {
    routes: ['GET /commissions'],
    auth: 'none',
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/commissions', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/commission/_directory_results.html.slime',
        select: {
          fields: {
            items: {
              sel: '.commission',
              many: true,
              fields: {
                artist: { sel: '.commission__listing_artist', text: true },
                profileSlug: {
                  sel: '.commission__listing_artist a[href^="/profiles/"]',
                  attr: 'href',
                  as: 'lastSegment',
                },
                avatarUrl: { sel: 'img', attr: 'src', as: 'url', optional: true },
                priceRange: {
                  sel: '.commission__listing__body_text p:nth-of-type(1)',
                  text: true,
                  as: 'stripPrefix:Price Range:',
                },
                categories: {
                  sel: '.commission__listing__body_text p:nth-of-type(2)',
                  text: true,
                  as: 'stripPrefix:Categories:',
                },
                offers: {
                  sel: '.commission__listing__body_text p:nth-of-type(3)',
                  text: true,
                  as: 'stripPrefix:Offers:',
                },
              },
            },
            hasNext: { sel: 'nav.pagination a.js-next', exists: true },
          },
        },
      },
    ],
  },
});

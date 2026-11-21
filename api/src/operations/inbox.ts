import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { communicationFields } from './communication.ts';

const BOTH = ['philomena', 'furbooru'];
const NEXT: FieldSpec = { sel: 'nav.pagination a.js-next', exists: true };

/** What the header's bell and envelope show: how many notifications and conversations are unread. */
export const getUnreadCounts = defineOperation({
  operationId: 'getUnreadCounts',
  path: '/notifications/unread',
  method: 'get',
  summary: 'How many unread notifications and conversations the signed-in visitor has.',
  tags: ['inbox'],
  response: s.ref('UnreadCounts'),
  examples: {},
  philomena: {
    routes: ['GET /notifications/unread'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'json',
        flavors: BOTH,
        request: { method: 'GET', path: '/notifications/unread' },
        map: { notifications: '/notifications', conversations: '/conversations' },
      },
    ],
  },
});

/** One notification: the sentence the site shows, when, and where it leads. */
const notificationFields: Record<string, FieldSpec> = {
  text: { sel: '.flex__grow > div', text: true },
  createdAt: { sel: 'time', attr: 'datetime' },
  // The first link that is not a profile: the topic, image or gallery it is about.
  url: { sel: 'strong > a:not([href^="/profiles/"])', attr: 'href', as: 'url' },
};

export const listNotifications = defineOperation({
  operationId: 'listNotifications',
  path: '/notifications',
  method: 'get',
  summary: 'The notification area: the latest notifications of each kind.',
  tags: ['inbox'],
  response: s.ref('NotificationOverview'),
  examples: {},
  philomena: {
    routes: ['GET /notifications'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/notifications' },
        template: 'lib/philomena_web/templates/notification/index.html.slime',
        select: {
          fields: {
            categories: {
              sel: '.notification-type-block',
              many: true,
              optional: true,
              fields: {
                title: { sel: '.block__header__title', text: true },
                category: { sel: 'a[href^="/notifications/categories/"]', attr: 'href', as: 'lastSegment' },
                total: { sel: 'a[href^="/notifications/categories/"]', text: true, as: 'lastInt' },
                items: { sel: '.notification', many: true, fields: notificationFields },
              },
            },
          },
        },
      },
    ],
  },
});

export const getNotificationCategory = defineOperation({
  operationId: 'getNotificationCategory',
  path: '/notifications/categories/{category}',
  method: 'get',
  summary: 'One kind of notification, a page at a time. Categories are named as the notification area links them.',
  tags: ['inbox'],
  params: [
    { name: 'category', in: 'path', schema: s.string(), required: true },
    { name: 'page', in: 'query', schema: s.int() },
  ],
  response: s.ref('NotificationCategory'),
  examples: { category: 'forum_post' },
  philomena: {
    routes: ['GET /notifications/categories/:id'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/notifications/categories/{category}', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/notification/category/show.html.slime',
        select: {
          fields: {
            title: { sel: '.notification-type-block .block__header__title', text: true },
            items: { sel: '.notification', many: true, optional: true, fields: notificationFields },
            hasNext: NEXT,
          },
        },
      },
    ],
  },
});

export const listConversations = defineOperation({
  operationId: 'listConversations',
  path: '/conversations',
  method: 'get',
  summary: 'The signed-in visitor’s private conversations, newest message first.',
  tags: ['inbox'],
  params: [{ name: 'page', in: 'query', schema: s.int() }],
  response: s.ref('ConversationList'),
  examples: {},
  philomena: {
    routes: ['GET /conversations'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/conversations', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/conversation/index.html.slime',
        select: {
          fields: {
            items: {
              sel: 'table.table > tbody > tr',
              many: true,
              optional: true,
              fields: {
                slug: { sel: '.table--communication-list__name a', attr: 'href', as: 'lastSegment' },
                title: { sel: '.table--communication-list__name a', text: true },
                startedAt: { sel: '.small-text time:nth-of-type(1)', attr: 'datetime' },
                lastMessageAt: { sel: '.small-text time:nth-of-type(2)', attr: 'datetime' },
                withUser: { sel: '.table--communication-list__stats strong', text: true },
              },
            },
            hasNext: NEXT,
          },
        },
      },
    ],
  },
});

export const getConversation = defineOperation({
  operationId: 'getConversation',
  path: '/conversations/{slug}',
  method: 'get',
  summary: 'A private conversation and one page of its messages. Opening it marks it read.',
  tags: ['inbox'],
  params: [
    { name: 'slug', in: 'path', schema: s.string(), required: true },
    { name: 'page', in: 'query', schema: s.int() },
  ],
  response: s.ref('Conversation'),
  examples: { slug: 'verification-chat' },
  philomena: {
    routes: ['GET /conversations/:id'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'html',
        flavors: BOTH,
        request: { method: 'GET', path: '/conversations/{slug}', query: { page: '{page|1}' } },
        template: 'lib/philomena_web/templates/conversation/show.html.slime',
        select: {
          fields: {
            title: { sel: 'h1', text: true },
            withUser: { sel: '.block__header strong', text: true },
            messages: {
              sel: 'article.communication',
              many: true,
              fields: Object.fromEntries(Object.entries(communicationFields()).filter(([name]) => name !== 'id')),
            },
            hasNext: NEXT,
          },
        },
      },
    ],
  },
});

/** A report the visitor filed. Philomena ties one to a rule; Furbooru does not. */
function reports(columns: { reason: number; opened: number; rule?: number }): FieldSpec {
  return {
    sel: 'table.table > tbody > tr',
    many: true,
    optional: true,
    fields: {
      state: { sel: 'td:nth-child(1)', text: true },
      resource: { sel: 'td:nth-child(2)', text: true },
      resourceUrl: { sel: 'td:nth-child(2) a', attr: 'href', as: 'url', optional: true },
      ...(columns.rule ? { rule: { sel: `td:nth-child(${columns.rule})`, text: true } } : {}),
      reason: { sel: `td:nth-child(${columns.reason})`, text: true },
      openedAt: { sel: `td:nth-child(${columns.opened}) time`, attr: 'datetime' },
    },
  };
}

export const listReports = defineOperation({
  operationId: 'listReports',
  path: '/reports',
  method: 'get',
  summary: 'The reports the signed-in visitor filed.',
  tags: ['inbox'],
  params: [{ name: 'page', in: 'query', schema: s.int() }],
  response: s.ref('ReportList'),
  examples: {},
  philomena: {
    routes: ['GET /reports'],
    auth: 'session',
    cacheSeconds: 0,
    strategies: ['philomena', 'furbooru'].map(flavor => ({
      kind: 'html' as const,
      flavors: [flavor],
      request: { method: 'GET' as const, path: '/reports', query: { page: '{page|1}' } },
      template: 'lib/philomena_web/templates/report/index.html.slime',
      select: {
        fields: {
          items: reports(flavor === 'philomena' ? { rule: 3, reason: 4, opened: 5 } : { reason: 3, opened: 4 }),
          hasNext: NEXT,
        },
      },
    })),
  },
});

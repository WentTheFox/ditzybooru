import type { FieldSpec } from '../dsl/extract.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';

const TOKEN = { sel: 'meta[name=csrf-token]', attr: 'content' };
const BOTH = ['philomena', 'furbooru'];

interface Subject {
  /** Used in operation ids: `Image` gives `subscribeImage`. */
  name: string;
  /** Our path and the upstream's are the same: `/images/{id}`. */
  base: string;
  /** Path parameters, with an example each. */
  params: { name: string; example: string | number; int?: true }[];
  /** The upstream's names of those parameters, for the coverage keys. */
  routeBase: string;
}

const subjects: Subject[] = [
  {
    name: 'Image',
    base: '/images/{id}',
    params: [{ name: 'id', example: 1, int: true }],
    routeBase: '/images/:image_id',
  },
  {
    name: 'Topic',
    base: '/forums/{forum}/topics/{topic}',
    params: [
      { name: 'forum', example: 'dis' },
      { name: 'topic', example: 'example-topic' },
    ],
    routeBase: '/forums/:forum_id/topics/:topic_id',
  },
  {
    name: 'Forum',
    base: '/forums/{forum}',
    params: [{ name: 'forum', example: 'dis' }],
    routeBase: '/forums/:forum_id',
  },
  {
    name: 'Gallery',
    base: '/galleries/{id}',
    params: [{ name: 'id', example: 1, int: true }],
    routeBase: '/galleries/:gallery_id',
  },
  {
    name: 'Channel',
    base: '/channels/{id}',
    params: [{ name: 'id', example: 2, int: true }],
    routeBase: '/channels/:channel_id',
  },
];

function pathParams(subject: Subject) {
  return subject.params.map(({ name, int }) => ({
    name,
    in: 'path' as const,
    schema: int ? s.int() : s.string(),
    required: true,
  }));
}

function examples(subject: Subject) {
  return Object.fromEntries(subject.params.map(({ name, example }) => [name, example]));
}

/** The link the site swaps in after a (un)subscribe: the one that is not hidden says what a click would do next. */
const subscribed: FieldSpec = { sel: 'a.js-subscription-link[data-method="delete"]:not(.hidden)', exists: true };

function subscription(subject: Subject, on: boolean) {
  const verb = on ? 'subscribe' : 'unsubscribe';
  return defineOperation({
    operationId: `${verb}${subject.name}`,
    path: `${subject.base}/subscription`,
    method: on ? 'post' : 'delete',
    summary: `${on ? 'Subscribe to' : 'Unsubscribe from'} a ${subject.name.toLowerCase()} for notifications. Answers whether the visitor is subscribed now.`,
    tags: ['subscriptions'],
    params: pathParams(subject),
    response: s.ref('Subscription'),
    examples: examples(subject),
    philomena: {
      routes: [`${on ? 'POST' : 'DELETE'} ${subject.routeBase}/subscription`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/', csrf: TOKEN },
          request: { method: on ? 'POST' : 'DELETE', path: `${subject.base}/subscription` },
          result: { page: '', answer: true, select: { fields: { subscribed } } },
        },
      ],
    },
  });
}

function markRead(subject: Subject) {
  return defineOperation({
    operationId: `mark${subject.name}Read`,
    path: `${subject.base}/read`,
    method: 'post',
    summary: `Mark a ${subject.name.toLowerCase()}'s notifications as read for the visitor.`,
    tags: ['subscriptions'],
    params: pathParams(subject),
    response: s.ref('Done'),
    examples: examples(subject),
    philomena: {
      routes: [`POST ${subject.routeBase}/read`],
      auth: 'session',
      strategies: [
        {
          kind: 'form',
          flavors: BOTH,
          form: { page: '/', csrf: TOKEN },
          request: { method: 'POST', path: `${subject.base}/read` },
          result: { page: '', answer: true, select: { fields: {} } },
        },
      ],
    },
  });
}

const [image, topic, forum, gallery, channel] = subjects as [Subject, Subject, Subject, Subject, Subject];

export const subscribeImage = subscription(image, true);
export const unsubscribeImage = subscription(image, false);
export const subscribeTopic = subscription(topic, true);
export const unsubscribeTopic = subscription(topic, false);
export const subscribeForum = subscription(forum, true);
export const unsubscribeForum = subscription(forum, false);
export const subscribeGallery = subscription(gallery, true);
export const unsubscribeGallery = subscription(gallery, false);
export const subscribeChannel = subscription(channel, true);
export const unsubscribeChannel = subscription(channel, false);

export const markImageRead = markRead(image);
export const markTopicRead = markRead(topic);
export const markGalleryRead = markRead(gallery);
export const markChannelRead = markRead(channel);

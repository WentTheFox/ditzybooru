import type { FieldSpec } from '../dsl/extract.ts';
import type { Operation } from '../dsl/operation.ts';
import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { REJECTION, TOKEN } from './forms.ts';

const flash: Record<string, FieldSpec> = {
  message: { sel: '.flash--success', text: true, optional: true },
  _took: { sel: '.flash--success', exists: true },
};

interface Target {
  /** Used in the operation id: `Image` gives `reportImage`. */
  name: string;
  /** What is reported, for the summary. */
  what: string;
  /** Our path and the upstream's, up to `/reports`. */
  base: string;
  params: NonNullable<Operation['params']>;
  examples: Record<string, string | number>;
  routeBase: string;
}

const pathString = (name: string) => ({ name, in: 'path' as const, schema: s.string(), required: true });
const pathInt = (name: string) => ({ name, in: 'path' as const, schema: s.int(), required: true });

const targets: Target[] = [
  {
    name: 'Image',
    what: 'an image',
    base: '/images/{id}',
    params: [pathInt('id')],
    examples: { id: 1 },
    routeBase: '/images/:image_id',
  },
  {
    name: 'Comment',
    what: 'an image comment',
    base: '/images/{imageId}/comments/{id}',
    params: [pathInt('imageId'), pathInt('id')],
    examples: { imageId: 1, id: 1 },
    routeBase: '/images/:image_id/comments/:comment_id',
  },
  {
    name: 'Post',
    what: 'a forum post',
    base: '/forums/{forum}/topics/{topic}/posts/{id}',
    params: [pathString('forum'), pathString('topic'), pathInt('id')],
    examples: { forum: 'dis', topic: 'example-topic', id: 1 },
    routeBase: '/forums/:forum_id/topics/:topic_id/posts/:post_id',
  },
  {
    name: 'Gallery',
    what: 'a gallery',
    base: '/galleries/{id}',
    params: [pathInt('id')],
    examples: { id: 1 },
    routeBase: '/galleries/:gallery_id',
  },
  {
    name: 'Profile',
    what: 'a user’s profile',
    base: '/profiles/{slug}',
    params: [pathString('slug')],
    examples: { slug: 'Pleb' },
    routeBase: '/profiles/:profile_id',
  },
  {
    name: 'Commission',
    what: 'a commission listing',
    base: '/profiles/{slug}/commission',
    params: [pathString('slug')],
    examples: { slug: 'Pleb' },
    routeBase: '/profiles/:profile_id/commission',
  },
  {
    name: 'Conversation',
    what: 'a private conversation (staff can then read all of it)',
    base: '/conversations/{slug}',
    params: [pathString('slug')],
    examples: { slug: 'verification-chat' },
    routeBase: '/conversations/:conversation_id',
  },
];

/**
 * Report something to the staff. Philomena asks which rule it breaks, Furbooru
 * for a category; the site allows three open reports per visitor.
 */
function report(target: Target) {
  const strategy = (flavor: string, field: string) => ({
    kind: 'form' as const,
    flavors: [flavor],
    form: { page: `${target.base}/reports/new`, csrf: TOKEN },
    request: {
      method: 'POST' as const,
      path: `${target.base}/reports`,
      body: {
        [field]: '{rule}',
        'report[reason]': '{reason}',
        'report[user_agent]': 'ditzybooru',
        'h-captcha-response': '{captchaToken}',
      },
    },
    result: {
      page: '/',
      follow: true as const,
      select: { fields: flash },
      must: ['/_took'],
      errors: REJECTION,
    },
  });
  return defineOperation({
    operationId: `report${target.name}`,
    path: `${target.base}/reports`,
    method: 'post',
    summary: `Report ${target.what} to the staff. The site allows three open reports at a time.`,
    tags: ['reports'],
    params: target.params,
    body: s.object({
      /** Philomena: the rule's number (its id). Furbooru: the category, e.g. `Rule #2` or `Other`. */
      rule: s.string(),
      reason: s.optional(s.string()),
      /** What the captcha widget gave the browser, when the site asks for a captcha. */
      captchaToken: s.optional(s.string()),
    }),
    response: s.ref('Notice'),
    examples: { ...target.examples, rule: '2', reason: 'Reported by the verifier.' },
    philomena: {
      routes: [`POST ${target.routeBase}/reports`, `GET ${target.routeBase}/reports/new`],
      auth: 'session',
      strategies: [strategy('philomena', 'report[rule_id]'), strategy('furbooru', 'report[category]')],
    },
  });
}

const [image, comment, post, gallery, profile, commission, conversation] = targets as [
  Target,
  Target,
  Target,
  Target,
  Target,
  Target,
  Target,
];

export const reportImage = report(image);
export const reportComment = report(comment);
export const reportPost = report(post);
export const reportGallery = report(gallery);
export const reportProfile = report(profile);
export const reportCommission = report(commission);
export const reportConversation = report(conversation);

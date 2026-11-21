import { defineOperation } from '../dsl/operation.ts';
import { s } from '../dsl/schema.ts';
import { communicationFields } from './communication.ts';
import { noticeForm, TOKEN } from './forms.ts';

const BOTH = ['philomena', 'furbooru'];

const anonymous = { anonymous: s.optional(s.bool()) };

export const createComment = defineOperation({
  operationId: 'createComment',
  path: '/images/{id}/comments',
  method: 'post',
  summary: 'Comment on an image. Answers the new comment as the site renders it. The site allows one every 15 seconds.',
  tags: ['comments'],
  params: [{ name: 'id', in: 'path', schema: s.int(), required: true }],
  body: s.object({ body: s.string(), ...anonymous }),
  response: s.ref('CommentPosted'),
  examples: { id: 1, body: 'Posted by the verifier.', anonymous: 'false' },
  philomena: {
    routes: ['POST /images/:image_id/comments'],
    auth: 'session',
    strategies: [
      {
        kind: 'form',
        flavors: BOTH,
        form: { page: '/images/{id}', csrf: TOKEN },
        request: {
          method: 'POST',
          path: '/images/{id}/comments',
          body: { 'comment[body]': '{body}', 'comment[anonymous]': '{anonymous|false}' },
        },
        result: {
          page: '',
          answer: true,
          select: {
            fields: {
              comments: { sel: 'article.communication', many: true, fields: communicationFields() },
              // A comment the site refused redirects with a flash instead.
              _posted: { sel: 'article.communication', exists: true },
            },
          },
          must: ['/_posted'],
          errors: '.flash--warning, .flash--error',
        },
      },
    ],
  },
});

export const updateComment = noticeForm({
  operationId: 'updateComment',
  group: 'comments',
  method: 'put',
  path: '/images/{imageId}/comments/{id}',
  summary: 'Edit one of the visitor’s own comments.',
  params: [
    { name: 'imageId', in: 'path', schema: s.int(), required: true },
    { name: 'id', in: 'path', schema: s.int(), required: true },
  ],
  body: s.object({ body: s.string(), editReason: s.optional(s.string()) }),
  formPage: '/images/{imageId}/comments/{id}/edit',
  request: {
    path: '/images/{imageId}/comments/{id}',
    body: { 'comment[body]': '{body}', 'comment[edit_reason]': '{editReason}' },
  },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: [
    'PUT /images/:image_id/comments/:id',
    'PATCH /images/:image_id/comments/:id',
    'GET /images/:image_id/comments/:id/edit',
  ],
  examples: { imageId: 1, id: 1, body: 'Edited by the verifier.' },
});

export const createPost = noticeForm({
  operationId: 'createPost',
  group: 'forums',
  path: '/forums/{forum}/topics/{topic}/posts',
  summary: 'Reply in a topic. The site allows one every 15 seconds.',
  params: [
    { name: 'forum', in: 'path', schema: s.string(), required: true },
    { name: 'topic', in: 'path', schema: s.string(), required: true },
  ],
  body: s.object({ body: s.string(), ...anonymous }),
  formPage: '/forums/{forum}/topics/{topic}',
  request: {
    path: '/forums/{forum}/topics/{topic}/posts',
    body: { 'post[body]': '{body}', 'post[anonymous]': '{anonymous|false}' },
  },
  signedIn: true,
  follow: true,
  routes: ['POST /forums/:forum_id/topics/:topic_id/posts'],
  examples: { forum: 'dis', topic: 'example-topic', body: 'Replied by the verifier.' },
});

export const updatePost = noticeForm({
  operationId: 'updatePost',
  group: 'forums',
  method: 'put',
  path: '/forums/{forum}/topics/{topic}/posts/{id}',
  summary: 'Edit one of the visitor’s own posts.',
  params: [
    { name: 'forum', in: 'path', schema: s.string(), required: true },
    { name: 'topic', in: 'path', schema: s.string(), required: true },
    { name: 'id', in: 'path', schema: s.int(), required: true },
  ],
  body: s.object({ body: s.string(), editReason: s.optional(s.string()) }),
  formPage: '/forums/{forum}/topics/{topic}/posts/{id}/edit',
  request: {
    path: '/forums/{forum}/topics/{topic}/posts/{id}',
    body: { 'post[body]': '{body}', 'post[edit_reason]': '{editReason}' },
  },
  verb: 'PUT',
  signedIn: true,
  follow: true,
  routes: [
    'PUT /forums/:forum_id/topics/:topic_id/posts/:id',
    'PATCH /forums/:forum_id/topics/:topic_id/posts/:id',
    'GET /forums/:forum_id/topics/:topic_id/posts/:id/edit',
  ],
  examples: { forum: 'dis', topic: 'example-topic', id: 1, body: 'Edited post, by the verifier.' },
});

export const createTopic = noticeForm({
  operationId: 'createTopic',
  group: 'forums',
  path: '/forums/{forum}/topics',
  summary: 'Start a topic. The site allows one every 5 minutes.',
  params: [{ name: 'forum', in: 'path', schema: s.string(), required: true }],
  body: s.object({ title: s.string(), body: s.string(), ...anonymous }),
  formPage: '/forums/{forum}/topics/new',
  request: {
    path: '/forums/{forum}/topics',
    body: { 'topic[title]': '{title}', 'topic[posts][0][body]': '{body}', 'topic[anonymous]': '{anonymous|false}' },
  },
  signedIn: true,
  follow: true,
  routes: ['POST /forums/:forum_id/topics', 'GET /forums/:forum_id/topics/new'],
  examples: { forum: 'dis', title: 'Verifier topic', body: 'A topic made by the verifier.' },
});

export const previewPost = defineOperation({
  operationId: 'previewPost',
  path: '/posts/preview',
  method: 'post',
  summary: 'Render text as the site would show a post or comment, to preview it before sending.',
  tags: ['comments'],
  body: s.object({ body: s.string(), ...anonymous }),
  response: s.ref('PostPreview'),
  examples: { body: '**bold** and *italic*', anonymous: 'false' },
  philomena: {
    routes: ['POST /posts/preview'],
    auth: 'session:anonymous',
    cacheSeconds: 0,
    strategies: [
      {
        kind: 'form',
        flavors: BOTH,
        form: { page: '/', csrf: TOKEN },
        request: {
          method: 'POST',
          path: '/posts/preview',
          encoding: 'json',
          body: { body: '{body}', anonymous: '{anonymous|false}' },
        },
        result: {
          page: '',
          answer: true,
          select: { fields: { bodyHtml: { sel: '.communication__body__text', html: true, as: 'sanitizedHtml' } } },
        },
      },
    ],
  },
});

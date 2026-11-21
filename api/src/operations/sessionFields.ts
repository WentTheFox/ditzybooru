import type { FieldSpec } from '../dsl/extract.ts';

/** `.js-datastore` is the one element every page carries the signed-in state on. */
function user(attr: string, as?: FieldSpec['as']): FieldSpec {
  return { sel: '.js-datastore', attr: `data-user-${attr}`, optional: true, ...(as ? { as } : {}) };
}

/** Who the visitor is, as any page of the site tells it. */
export const sessionFields = {
  signedIn: { sel: '.js-datastore', attr: 'data-user-is-signed-in', as: 'bool' },
  id: user('id', 'int'),
  name: user('name'),
  slug: user('slug'),
  role: user('role'),
  // The picture the site shows in its header for them; none when they have not set one.
  avatarUrl: { sel: '.avatar--28px img', attr: 'src', as: 'url', optional: true },
  // Signed in with a password, but the site wants the 2FA code before it lets them in.
  secondFactorRequired: { sel: 'form[action="/sessions/totp"]', exists: true },
} satisfies Record<string, FieldSpec>;

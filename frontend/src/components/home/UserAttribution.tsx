import { Link } from '@tanstack/react-router';

import type { Attribution } from '#/lib/types';

/** Renders a comment/post author as a profile link, or plain anonymous text. */
export function UserAttribution({ author }: { author: Attribution }) {
  if (author.user) {
    return (
      <Link to="/profiles/$slug" params={{ slug: author.user.slug }}>
        <strong>{author.user.name}</strong>
      </Link>
    );
  }

  return <strong>{author.anonymousName ?? 'Anonymous'}</strong>;
}

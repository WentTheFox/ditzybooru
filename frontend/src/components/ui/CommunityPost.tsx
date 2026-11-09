import { Avatar } from '#/components/philomena/Avatar';
import {
  Communication,
  CommunicationAuthor,
  CommunicationAuthorName,
  CommunicationAvatar,
  CommunicationBody,
  CommunicationContent,
  CommunicationText,
} from '#/components/philomena/Communication';
import { Prose } from '#/components/ui/Prose';
import { RelativeTime } from '#/components/ui/RelativeTime';
import type { RenderedPost } from '#/lib/api/backend/content';
import { initials } from '#/lib/format';

/**
 * A forum post or an image comment: who wrote it, when, and what they wrote.
 * `idPrefix` is what its anchor is called (`post_`, `comment_`), as on the sites.
 */
export function CommunityPost({ post, idPrefix }: { post: RenderedPost; idPrefix: string }) {
  return (
    <Communication id={`${idPrefix}${post.id}`}>
      <CommunicationBody>
        <CommunicationAvatar>
          <Avatar size="sm" src={post.avatarUrl ?? undefined} alt={post.author}>
            {initials(post.author)}
          </Avatar>
        </CommunicationAvatar>
        <CommunicationContent>
          <CommunicationAuthor>
            <CommunicationAuthorName>{post.author}</CommunicationAuthorName>
            <RelativeTime className="muted-text" dateTime={post.createdAt} />
          </CommunicationAuthor>
          <CommunicationText>
            {post.bodyHtml === undefined ? (
              // Only the markup the author wrote, as plain text.
              <p className="plain-text">{post.body}</p>
            ) : (
              <Prose html={post.bodyHtml} />
            )}
          </CommunicationText>
        </CommunicationContent>
      </CommunicationBody>
    </Communication>
  );
}

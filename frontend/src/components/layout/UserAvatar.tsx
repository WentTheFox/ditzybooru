import { Avatar } from '#/components/philomena/Avatar';
import { initials } from '#/lib/format';

/** A user's picture, or their initials when they have none. */
export function UserAvatar({ name, src }: { name: string; src: string | null }) {
  return (
    <Avatar size="xs" src={src ?? undefined} alt={name}>
      {initials(name)}
    </Avatar>
  );
}

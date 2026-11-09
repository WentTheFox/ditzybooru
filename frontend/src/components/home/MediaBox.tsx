import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowBigDown, ArrowBigUp, EyeOff, FolderPlus, Link2, MoreHorizontal, Star } from 'lucide-react';

import type { Media } from '#/lib/types';
import { useImageInteraction } from '#/hooks/use-image-interaction';
import { Int } from '#/components/ui/Int';
import { Dropdown, DropdownIcon, DropdownItem, DropdownMenu } from '#/components/philomena/Dropdown';
import {
  MediaBox as PhilomenaMediaBox,
  MediaBoxHeader,
  MediaBoxOverlay,
  MediaBoxScore,
  MediaBoxVeil,
  mediaBoxActionClass,
  mediaBoxContentClass,
} from '#/components/philomena/MediaBox';

import type { ClassValue } from '#/lib/utils';

/**
 * Philomena's speech bubble: rounder than lucide's `MessageCircle` and tailed
 * from the bottom-left corner rather than tapered. Drawn here because no icon
 * in the set carries that shape.
 *
 * The viewBox starts at 0.74 rather than 0 because the path's ink centres at
 * y 12.67 of 24; the offset puts the glyph on the bar's optical centre line at
 * any size, which a CSS nudge would only do at one.
 */
function CommentBubble() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0.74 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
    </svg>
  );
}

interface InteractionButtonProps {
  /** The action's kind, which picks its color in the stylesheet. */
  kind: 'fave' | 'upvote' | 'downvote';
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}

/**
 * A toggle in the action bar. The package's `MediaBoxAction` is an anchor, and
 * these change state rather than navigate, so they are buttons wearing the
 * same classes.
 */
function InteractionButton({ kind, onClick, active, title, children }: InteractionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={mediaBoxActionClass(kind, active)}
    >
      {children}
    </button>
  );
}

/**
 * The card's overflow menu: the actions that are used rarely enough not to earn
 * a permanent slot in a bar this dense.
 *
 * Click-to-open rather than hover-revealed - a grid is dozens of these, and
 * sweeping the pointer across it would flick menus open the whole way.
 */
function MediaBoxMenu({
  image,
  hidden,
  onToggleHidden,
  inGallery,
  onToggleGallery,
}: {
  image: Media;
  hidden: boolean;
  onToggleHidden: () => void;
  inGallery: boolean;
  onToggleGallery: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
  };

  return (
    <Dropdown ref={ref} manual open={open} className="media-box__more">
      <button
        type="button"
        className={mediaBoxActionClass('hide')}
        title="More"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(prev => !prev);
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      <DropdownMenu end role="menu">
        <DropdownItem
          as="button"
          type="button"
          role="menuitem"
          onClick={() => {
            void navigator.clipboard.writeText(new URL(`/images/${image.id}`, location.origin).href);
            close();
          }}
        >
          <DropdownIcon>
            <Link2 size={14} />
          </DropdownIcon>
          Copy link
        </DropdownItem>
        <DropdownItem
          as="button"
          type="button"
          role="menuitemcheckbox"
          aria-checked={inGallery}
          current={inGallery}
          onClick={() => {
            onToggleGallery();
            close();
          }}
        >
          <DropdownIcon>
            <FolderPlus size={14} />
          </DropdownIcon>
          {inGallery ? 'Remove from gallery' : 'Add to gallery'}
        </DropdownItem>
        <DropdownItem
          as="button"
          type="button"
          role="menuitemcheckbox"
          aria-checked={hidden}
          current={hidden}
          onClick={() => {
            onToggleHidden();
            close();
          }}
        >
          <DropdownIcon>
            <EyeOff size={14} />
          </DropdownIcon>
          {hidden ? 'Unhide' : 'Hide'}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function imageTitle(image: Media): string {
  return `Size: ${image.width}x${image.height} | Tagged: ${image.tags.join(', ')}`;
}

interface MediaBoxProps {
  className?: ClassValue;
  image: Media;
  /** Which representation to render; defaults to the standard thumb. */
  src?: string;
  /** Whether the interaction bar is drawn. The featured image goes without. */
  bar?: boolean;
}

/**
 * A single image thumbnail with Philomena's interaction bar (fave / upvote /
 * score / downvote / comments / more). Interactions update the on-screen
 * counters optimistically via {@link useImageInteraction}.
 *
 * The overflow menu's panel is let out of the action bar's clipping (see
 * `MediaBox.css`).
 */
export function MediaBox({ className, image, src = image.representations.thumb, bar = true }: MediaBoxProps) {
  const interaction = useImageInteraction(image);

  const title = imageTitle(image);
  const spoilered = image.spoilered && !interaction.hidden;
  const veiled = interaction.hidden || spoilered;
  const isVideo = image.mimeType === 'video/webm';
  // The element follows the file, not the media type: thumbnail sizes come
  // through as `.gif` stills, and only the larger ones stay video.
  const playable = src.endsWith('.webm');

  return (
    <PhilomenaMediaBox className={className} spoilered={spoilered} muted={interaction.hidden}>
      {bar ? (
        <MediaBoxHeader actions>
          <InteractionButton kind="fave" onClick={interaction.toggleFave} active={interaction.faved} title="Fave!">
            {/* Not showing the fave count, to keep the bar from crowding. */}
            <Star size={14} fill={interaction.faved ? 'currentColor' : 'none'} />
          </InteractionButton>

          <InteractionButton
            kind="upvote"
            onClick={interaction.toggleUpvote}
            active={interaction.vote === 'up'}
            title="Yay!"
          >
            <ArrowBigUp size={14} fill={interaction.vote === 'up' ? 'currentColor' : 'none'} />
          </InteractionButton>
          {/* Deliberately not `<Int>`: the thousands separator buys nothing on a
              3-4 digit score and its extra glyph is real width in a bar this
              tight. */}
          <MediaBoxScore title="Score">{interaction.score}</MediaBoxScore>
          <InteractionButton
            kind="downvote"
            onClick={interaction.toggleDownvote}
            active={interaction.vote === 'down'}
            title="Neigh!"
          >
            <ArrowBigDown size={14} fill={interaction.vote === 'down' ? 'currentColor' : 'none'} />
          </InteractionButton>

          <Link
            to="/images/$id"
            params={{ id: image.id }}
            hash="comments"
            title="Comments"
            className={mediaBoxActionClass('comments')}
          >
            <CommentBubble />
            <Int value={image.commentCount} />
          </Link>

          <MediaBoxMenu
            image={image}
            hidden={interaction.hidden}
            onToggleHidden={interaction.toggleHidden}
            inGallery={interaction.inGallery}
            onToggleGallery={interaction.toggleGallery}
          />
        </MediaBoxHeader>
      ) : null}

      {/* The package's content area is itself the link. */}
      <Link to="/images/$id" params={{ id: image.id }} title={title} className={mediaBoxContentClass()}>
        {playable ? (
          <video src={src} aria-label={title} autoPlay loop muted playsInline disablePictureInPicture />
        ) : (
          <img src={src} alt={title} loading="lazy" />
        )}
        {veiled ? (
          <MediaBoxVeil>
            <span className="flex flex-column flex-center gap-sm">
              <EyeOff size={20} aria-hidden="true" />
              {interaction.hidden ? 'Hidden' : 'Spoilered'}
            </span>
          </MediaBoxVeil>
        ) : null}
        {isVideo && !veiled ? <MediaBoxOverlay bottom>WebM</MediaBoxOverlay> : null}
      </Link>
    </PhilomenaMediaBox>
  );
}

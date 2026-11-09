import { useState } from 'react';
import type { ReactNode, Ref } from 'react';

import type { Media } from '#/lib/types';
import { Int } from '#/components/ui/Int';
import { Pagination } from '#/components/ui/Pagination';
import { Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';
import { MediaList } from '#/components/philomena/MediaBox';
import { PaginationBar, PaginationInfo } from '#/components/philomena/Pagination';
import { MEDIA_PER_PAGE } from '#/lib/media';
import { MediaBox } from './MediaBox';

/** Thumbnail grid sizing presets. */
type MediaGridSize =
  /** The package's small thumbnail width - used for compact lists like watched images. */
  | 'small'
  /** The package's regular thumbnail width (Philomena's main list). */
  | 'large';

/**
 * The `view-transition-name` shared by the home page's grid and the search
 * page's, so paging from one to the other morphs the block rather than cutting.
 * At most one element per page may carry it - two cancel the transition.
 */
export const SEARCH_RESULTS_TRANSITION = 'search-results';

/**
 * The search grid's `id`, and the hash the pagination navigates to. The router
 * scrolls the fragment into view before paint, so the reader never sees the
 * grid land and then correct itself.
 */
export const SEARCH_RESULTS_ID = 'search-results';

/**
 * Who owns the page number. Omitted, the grid keeps its own and pages in place,
 * which is what a side block wants; given, the caller owns it and the grid only
 * reports clicks.
 */
interface MediaGridPaging {
  page: number;
  onPageChange: (page: number) => void;
  /**
   * Whether the pagination carries the steps that go back. A grid pinned to its
   * own first page has nothing behind it.
   */
  back?: boolean;
}

interface MediaGridProps {
  /** Human-readable label, rendered as the block's title. */
  label: string;
  images: Array<Media>;
  /** How many images the backing query matches in total, across all pages. */
  total: number;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Heading level, so the page keeps a single logical `h1`. */
  headingLevel?: 1 | 2;
  /** Thumbnail grid sizing preset. */
  size?: MediaGridSize;
  paging?: MediaGridPaging;
  /** Set to {@link SEARCH_RESULTS_TRANSITION} on the grid that morphs across a
   *  search navigation. */
  viewTransitionName?: string;
  /** Set to {@link SEARCH_RESULTS_ID} on the grid the pagination scrolls to. */
  id?: string;
  /** The block itself, for a page that has to move focus into the grid. */
  ref?: Ref<HTMLElement>;
}

/**
 * An image gallery: a block title bar, a responsive thumbnail list, and a
 * footer with pagination and the result count. Mirrors Philomena's image
 * `index`.
 */
export function MediaGrid({
  label,
  images,
  total,
  icon,
  headingLevel = 2,
  size = 'large',
  paging,
  viewTransitionName,
  id,
  ref,
}: MediaGridProps) {
  const [ownPage, setOwnPage] = useState(1);

  const requestedPage = paging?.page ?? ownPage;
  const setPage = paging?.onPageChange ?? setOwnPage;

  // The API reports how many images match, not how many pages that is, so the
  // count follows from the page size.
  const pageCount = Math.max(1, Math.ceil(total / MEDIA_PER_PAGE));
  const page = Math.min(requestedPage, pageCount);
  const shown = images.slice(0, MEDIA_PER_PAGE);
  const firstShown = (page - 1) * MEDIA_PER_PAGE + 1;

  return (
    // Focusable, but not tabbable. A document load on `#search-results` puts
    // focus here on its own; a client-side navigation does not, which is what
    // the search route's effect is for.
    <Block ref={ref} id={id} tabIndex={-1} style={{ viewTransitionName }}>
      <BlockHeader>
        {/* A heading role rather than an `h1`/`h2`, whose own size and margins
            do not belong in a title bar. */}
        <span role="heading" aria-level={headingLevel} className="flex flex-center gap-sm">
          {icon}
          {label}
        </span>
      </BlockHeader>

      <BlockContent>
        <MediaList className={size === 'small' ? 'small' : undefined}>
          {shown.map(image => (
            <MediaBox key={image.id} image={image} />
          ))}
        </MediaList>
      </BlockContent>

      {/* A single page has nowhere to page to, and a count that only repeats
       * what is on screen. */}
      {pageCount > 1 ? (
        <BlockContent>
          <PaginationBar>
            <Pagination label={label} page={page} pageCount={pageCount} onPageChange={setPage} back={paging?.back} />
            <PaginationInfo>
              Showing{' '}
              <strong>
                <Int value={firstShown} />
                &ndash;
                <Int value={firstShown + shown.length - 1} />
              </strong>{' '}
              of{' '}
              <strong>
                <Int value={total} />
              </strong>{' '}
              total
            </PaginationInfo>
          </PaginationBar>
        </BlockContent>
      ) : null}
    </Block>
  );
}

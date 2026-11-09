import type { MouseEvent } from 'react';

import { Int } from '#/components/ui/Int';
import {
  Pagination as PaginationRow,
  PaginationGap,
  PaginationIcon,
  PaginationLink,
} from '#/components/philomena/Pagination';

import type { ClassValue } from '#/lib/utils';

/** Pages shown either side of the current one. */
const WINDOW = 2;

interface PaginationProps {
  /** The currently active page, 1-based. */
  page: number;
  pageCount: number;
  /** Called with the requested page when the user picks a different one. */
  onPageChange: (page: number) => void;
  /**
   * What this navigator pages through. Required because a page may carry more
   * than one, and two `<nav>`s both labelled "Pagination" are indistinguishable
   * to anyone navigating by landmark.
   */
  label: string;
  /**
   * Whether the row carries the steps that go back. A grid pinned to its own
   * first page has nothing behind it, and any step forward leaves it anyway.
   */
  back?: boolean;
  className?: ClassValue;
}

/**
 * A page navigator: step links around a window on the numbered pages, with a
 * gap marking each run of pages held back. On a narrow screen the stylesheet
 * keeps only the steps and the current page.
 *
 * Purely presentational - it reports changes via
 * {@link PaginationProps.onPageChange} so each caller keeps its own page state.
 * The links carry no address of their own: the caller navigates.
 */
export function Pagination({ page, pageCount, onPageChange, label, back = true, className }: PaginationProps) {
  const first = Math.max(1, page - WINDOW);
  const last = Math.min(pageCount, page + WINDOW);
  const run = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  const go = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onPageChange(target);
  };

  /* One of first, prev, next, last. The word hides on a narrow screen, where
   * the icon carries the step on its own. */
  function step(target: number, name: string, icon: string, iconFirst: boolean) {
    const icons = <PaginationIcon key="icon">{icon}</PaginationIcon>;
    const content = iconFirst ? [icons, name] : [name, icons];

    return (
      <PaginationLink href="#" disabled={target === page} aria-label={`${name} page`} onClick={go(target)}>
        {content}
      </PaginationLink>
    );
  }

  return (
    <PaginationRow aria-label={`${label} pages`} className={className}>
      {back ? (
        <>
          {step(1, 'First', '«', true)}
          {step(Math.max(page - 1, 1), 'Prev', '‹', true)}
        </>
      ) : null}

      {first > 1 ? <PaginationGap /> : null}

      {run.map(p => (
        <PaginationLink key={p} href="#" current={p === page} aria-label={`Page ${p}`} onClick={go(p)}>
          <Int value={p} />
        </PaginationLink>
      ))}

      {last < pageCount ? <PaginationGap /> : null}

      {step(Math.min(page + 1, pageCount), 'Next', '›', false)}
      {step(pageCount, 'Last', '»', false)}
    </PaginationRow>
  );
}

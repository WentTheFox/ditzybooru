import { useQuery } from '@tanstack/react-query';

import { useDataSource } from '#/hooks/use-data-source';
import { mediaSearchQuery } from '#/lib/api/queries';
import type { MediaPage } from '#/lib/api/types';
import { MEDIA_PER_PAGE } from '#/lib/media';

const EMPTY_PAGE: MediaPage = { images: [], total: 0 };

/** A page of search results, refetched when the reader pages. The route loader
 *  has already filled the page it was entered on. */
export function useMediaSearch(query: string, page: number): MediaPage {
  const kind = useDataSource();

  const { data } = useQuery(mediaSearchQuery(kind, { query, page, perPage: MEDIA_PER_PAGE }));

  return data ?? EMPTY_PAGE;
}

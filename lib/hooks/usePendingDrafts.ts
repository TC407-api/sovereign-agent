'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function usePendingDrafts() {
  const drafts = useQuery(api.drafts.getPendingDrafts);

  const isLoading = drafts === undefined;
  const draftsList = drafts ?? [];
  const count = draftsList.length;
  const hasPendingDrafts = count > 0;

  return {
    drafts: draftsList,
    isLoading,
    count,
    hasPendingDrafts,
  };
}

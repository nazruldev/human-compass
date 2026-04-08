import {
  getActiveEntries,
  getHistoricalEntries,
  getJournalEntries,
  getJournalEntry,
} from "@/services/journalService";
import { useUser } from "@clerk/clerk-expo";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useJournalEntries(page = 1) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["journal-entries", page, userId],
    queryFn: () => getJournalEntries(userId, { page, limit: PAGE_SIZE }),
  });
}

export function useActiveJournalEntries() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["journal-entries", "active", userId],
    queryFn: () => getActiveEntries(userId),
  });
}

export function useHistoricalJournalEntriesInfinite() {
  const { user } = useUser();
  const userId = user?.id;

  return useInfiniteQuery({
    queryKey: ["journal-entries", "historical", userId],
    queryFn: async ({ pageParam = 1 }) =>
      getHistoricalEntries(userId, {
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });
}

export function useJournalEntry(id: string | undefined) {
  return useQuery({
    queryKey: ["journal-entry", id],
    queryFn: () => getJournalEntry(id!),
    enabled: !!id,
  });
}

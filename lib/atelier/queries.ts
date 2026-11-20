/**
 * TanStack Query hooks for Atelier journal (PLAN §2 cacheable lane).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createJournalApi,
  type CreateJournalInput,
  type UpdateJournalInput,
} from "@/lib/atelier/api";
import { localJournalStore } from "@/lib/atelier/local-store";
import { track } from "@/lib/analytics";
import { useLensUserId } from "@/lib/lens/session";

export const journalKeys = {
  all: ["journal"] as const,
  list: (userId: string) => ["journal", userId] as const,
  detail: (userId: string, entryId: string) =>
    ["journal", userId, entryId] as const,
};

function api() {
  return createJournalApi(localJournalStore);
}

export function useJournalUserId(): string {
  return useLensUserId();
}

export function useJournalListQuery() {
  const userId = useJournalUserId();
  return useQuery({
    queryKey: journalKeys.list(userId),
    queryFn: () => api().list(userId),
  });
}

export function useJournalEntryQuery(entryId: string | undefined) {
  const userId = useJournalUserId();
  return useQuery({
    queryKey: journalKeys.detail(userId, entryId ?? ""),
    enabled: Boolean(entryId),
    queryFn: () => {
      if (!entryId) return null;
      return api().get(userId, entryId);
    },
  });
}

export function useCreateJournalMutation() {
  const userId = useJournalUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJournalInput) => api().create(userId, input),
    onSuccess: async () => {
      track("journal_saved", { action: "create" });
      await queryClient.invalidateQueries({
        queryKey: journalKeys.list(userId),
      });
    },
  });
}

export function useUpdateJournalMutation() {
  const userId = useJournalUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      patch,
    }: {
      entryId: string;
      patch: UpdateJournalInput;
    }) => api().update(userId, entryId, patch),
    onSuccess: async (entry) => {
      track("journal_saved", { action: "update" });
      await queryClient.invalidateQueries({
        queryKey: journalKeys.list(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: journalKeys.detail(userId, entry.id),
      });
    },
  });
}

export function useRemoveJournalMutation() {
  const userId = useJournalUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api().remove(userId, entryId),
    onSuccess: async (_void, entryId) => {
      await queryClient.invalidateQueries({
        queryKey: journalKeys.list(userId),
      });
      await queryClient.removeQueries({
        queryKey: journalKeys.detail(userId, entryId),
      });
    },
  });
}

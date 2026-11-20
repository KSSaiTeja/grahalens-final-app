/**
 * TanStack Query hooks for Bonds (PLAN §2 cacheable lane).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  canAddBond,
  createBondApi,
  FREE_BOND_LIMIT,
  type CreateBondInput,
} from "@/lib/bonds/api";
import { localBondStore } from "@/lib/bonds/local-store";
import { track } from "@/lib/analytics";
import { useLensUserId } from "@/lib/lens/session";

export const bondKeys = {
  all: ["bonds"] as const,
  list: (userId: string) => ["bonds", userId] as const,
  detail: (userId: string, bondId: string) =>
    ["bonds", userId, bondId] as const,
};

function api() {
  return createBondApi(localBondStore);
}

export function useBondUserId(): string {
  return useLensUserId();
}

export function useBondsQuery() {
  const userId = useBondUserId();
  return useQuery({
    queryKey: bondKeys.list(userId),
    queryFn: () => api().list(userId),
  });
}

export function useBondQuery(bondId: string | undefined) {
  const userId = useBondUserId();
  return useQuery({
    queryKey: bondKeys.detail(userId, bondId ?? ""),
    enabled: Boolean(bondId),
    queryFn: () => {
      if (!bondId) return null;
      return api().get(userId, bondId);
    },
  });
}

export function useCanAddBond(isPrivate = false) {
  const bonds = useBondsQuery();
  const count = bonds.data?.length ?? 0;
  return {
    ...bonds,
    count,
    limit: FREE_BOND_LIMIT,
    canAdd: canAddBond(count, isPrivate),
  };
}

export function useCreateBondMutation() {
  const userId = useBondUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBondInput) => api().create(userId, input),
    onSuccess: async () => {
      track("bond_created");
      await queryClient.invalidateQueries({ queryKey: bondKeys.list(userId) });
    },
  });
}

export function useRemoveBondMutation() {
  const userId = useBondUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bondId: string) => api().remove(userId, bondId),
    onSuccess: async (_void, bondId) => {
      await queryClient.invalidateQueries({ queryKey: bondKeys.list(userId) });
      await queryClient.removeQueries({
        queryKey: bondKeys.detail(userId, bondId),
      });
    },
  });
}

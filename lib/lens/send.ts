/**
 * Lens send path — quota gate → companion turn → query invalidation.
 * Free: 6th message → paywall sheet reason=lens_quota (L6).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";

import { chatKeys } from "@/lib/ai/chat-api";
import {
  loadCompanionThread,
  sendCompanionTurn,
  type CompanionTurn,
} from "@/lib/ai/companion";
import { track } from "@/lib/analytics";
import {
  canSendLens,
  FREE_LENS_DAILY_LIMIT,
  getLensQuota,
  incrementLens,
  type LensQuota,
} from "@/lib/billing/quotas";
import {
  isPrivate,
  requirePrivate,
} from "@/lib/billing/entitlements";
import {
  resolveChatStore,
  resolveMemoryStore,
  resolveUsageStore,
  useLensUserId,
} from "@/lib/lens/session";
import { createMemoryApi, memoryKeys } from "@/lib/memory";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useLensStore } from "@/lib/store/lens";

export const quotaKeys = {
  lens: (userId: string) => ["quota", "lens", userId] as const,
};

export function useLensQuotaQuery() {
  const userId = useLensUserId();
  return useQuery({
    queryKey: quotaKeys.lens(userId),
    queryFn: () => getLensQuota(userId, { store: resolveUsageStore() }),
  });
}

export function useLensThreadsQuery() {
  const userId = useLensUserId();
  return useQuery({
    queryKey: chatKeys.threads(userId),
    queryFn: () => resolveChatStore().listThreads(userId),
  });
}

export function useLensMessagesQuery(threadId: string | null) {
  const userId = useLensUserId();
  return useQuery({
    queryKey: threadId
      ? chatKeys.messages(threadId)
      : (["chat", "messages", "none"] as const),
    enabled: !!threadId,
    queryFn: async () => {
      if (!threadId) return [];
      const { messages } = await loadCompanionThread(
        userId,
        threadId,
        resolveChatStore(),
      );
      return messages;
    },
  });
}

export function useLensMemoriesQuery() {
  const userId = useLensUserId();
  return useQuery({
    queryKey: memoryKeys.list(userId),
    queryFn: () => createMemoryApi(resolveMemoryStore()).list(userId),
  });
}

export type SendLensInput = {
  content: string;
  threadId?: string | null;
};

/**
 * Sends a grounded companion turn.
 * Returns `{ gated: true }` when free quota is exhausted (caller already routed).
 */
export function useSendLensMessage() {
  const userId = useLensUserId();
  const { natal } = useResolvedNatal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setOrbState = useLensStore((s) => s.setOrbState);
  const setActiveThreadId = useLensStore((s) => s.setActiveThreadId);
  const activeThreadId = useLensStore((s) => s.activeThreadId);

  return useMutation({
    mutationFn: async (
      input: SendLensInput,
    ): Promise<{ gated: true } | { gated: false; turn: CompanionTurn }> => {
      const content = input.content.trim();
      if (!content) throw new Error("Message content is required");

      const privateActive = isPrivate();
      const usage = resolveUsageStore();
      if (!privateActive) {
        const allowed = await canSendLens(userId, { store: usage });
        if (!allowed) {
          const gate = requirePrivate("lens_quota");
          if (!gate.allowed) {
            track("lens_quota_hit");
            router.push(gate.href as Href);
          }
          return { gated: true };
        }
      }

      setOrbState("reading");
      await new Promise((r) => setTimeout(r, 120));
      setOrbState("thinking");

      const memories = await createMemoryApi(resolveMemoryStore()).list(
        userId,
      );

      const turn = await sendCompanionTurn({
        userId,
        natal,
        content,
        threadId: input.threadId ?? activeThreadId ?? undefined,
        memories: memories.map((m) => ({
          body: m.body,
          salience: m.salience,
        })),
        store: resolveChatStore(),
      });

      if (!privateActive) {
        await incrementLens(userId, { store: usage });
      }

      track("lens_message_sent", { private: privateActive });
      return { gated: false, turn };
    },
    onSuccess: async (result) => {
      if (result.gated) {
        setOrbState("alert");
        return;
      }
      const { turn } = result;
      setActiveThreadId(turn.thread.id);
      setOrbState("speaking");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.threads(userId) }),
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(turn.thread.id),
        }),
        queryClient.invalidateQueries({ queryKey: quotaKeys.lens(userId) }),
      ]);
      setTimeout(() => {
        const current = useLensStore.getState().orbState;
        if (current === "speaking") setOrbState("idle");
      }, 900);
    },
    onError: () => {
      setOrbState("alert");
    },
  });
}

export type { LensQuota };
export { FREE_LENS_DAILY_LIMIT };

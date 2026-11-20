export const FREE_LENS_DAILY_LIMIT = 5;

export type LensQuota = {
  day: string;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
};

export interface UsageCounterStore {
  getLensCount(userId: string, day: string): Promise<number>;
  incrementLensCount(
    userId: string,
    day: string,
    limit: number,
  ): Promise<number | null>;
}

export type QuotaOptions = {
  now?: Date;
  limit?: number;
  store?: UsageCounterStore;
};

function requireValidDate(now: Date): void {
  if (Number.isNaN(now.getTime())) {
    throw new TypeError("Quota date must be valid");
  }
}

export function utcDay(now = new Date()): string {
  requireValidDate(now);
  return now.toISOString().slice(0, 10);
}

function nextUtcDay(day: string): string {
  const midnight = new Date(`${day}T00:00:00.000Z`);
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  return midnight.toISOString();
}

async function requireSupabase() {
  const { getSupabase } = await import("@/lib/supabase/client");
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

const supabaseUsageCounterStore: UsageCounterStore = {
  async getLensCount(userId, day) {
    const client = await requireSupabase();

    const { data, error } = await client
      .from("usage_counters")
      .select("lens_count")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();

    if (error) throw error;
    return data?.lens_count ?? 0;
  },

  async incrementLensCount(_userId, day, limit) {
    const client = await requireSupabase();

    const { data, error } = await client.rpc("increment_lens_usage", {
      p_day: day,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  },
};

function resolveOptions(options: QuotaOptions): {
  day: string;
  limit: number;
  store: UsageCounterStore;
} {
  const now = options.now ?? new Date();
  const limit = options.limit ?? FREE_LENS_DAILY_LIMIT;
  requireValidDate(now);
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("Lens quota limit must be a positive integer");
  }
  return {
    day: utcDay(now),
    limit,
    store: options.store ?? supabaseUsageCounterStore,
  };
}

export async function getLensQuota(
  userId: string,
  options: QuotaOptions = {},
): Promise<LensQuota> {
  const { day, limit, store } = resolveOptions(options);
  const used = await store.getLensCount(userId, day);

  return {
    day,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: nextUtcDay(day),
  };
}

export async function canSendLens(
  userId: string,
  options: QuotaOptions = {},
): Promise<boolean> {
  const quota = await getLensQuota(userId, options);
  return quota.used < quota.limit;
}

export async function incrementLens(
  userId: string,
  options: QuotaOptions = {},
): Promise<LensQuota> {
  const { day, limit, store } = resolveOptions(options);
  const used = await store.incrementLensCount(userId, day, limit);
  if (used === null) {
    throw new Error("Lens daily quota reached");
  }

  return {
    day,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: nextUtcDay(day),
  };
}

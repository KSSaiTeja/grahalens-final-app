import {
  FREE_LENS_DAILY_LIMIT,
  canSendLens,
  getLensQuota,
  incrementLens,
  type UsageCounterStore,
} from "@/lib/billing/quotas";

class InMemoryUsageCounterStore implements UsageCounterStore {
  private readonly counts = new Map<string, number>();

  async getLensCount(userId: string, day: string): Promise<number> {
    return this.counts.get(`${userId}:${day}`) ?? 0;
  }

  async incrementLensCount(
    userId: string,
    day: string,
    limit: number,
  ): Promise<number | null> {
    const key = `${userId}:${day}`;
    const count = this.counts.get(key) ?? 0;
    if (count >= limit) return null;
    const next = count + 1;
    this.counts.set(key, next);
    return next;
  }
}

describe("Lens UTC daily quota", () => {
  const userId = "user-1";
  let store: InMemoryUsageCounterStore;

  beforeEach(() => {
    store = new InMemoryUsageCounterStore();
  });

  it("blocks the sixth free Lens message on the same UTC day", async () => {
    const now = new Date("2026-07-29T23:59:59.999Z");

    for (let count = 0; count < FREE_LENS_DAILY_LIMIT; count += 1) {
      expect(await canSendLens(userId, { now, store })).toBe(true);
      await incrementLens(userId, { now, store });
    }

    expect(await canSendLens(userId, { now, store })).toBe(false);
    await expect(incrementLens(userId, { now, store })).rejects.toThrow(
      "Lens daily quota reached",
    );
  });

  it("rolls over exactly at midnight UTC", async () => {
    const beforeMidnight = new Date("2026-07-29T23:59:59.999Z");
    const midnight = new Date("2026-07-30T00:00:00.000Z");

    for (let count = 0; count < FREE_LENS_DAILY_LIMIT; count += 1) {
      await incrementLens(userId, { now: beforeMidnight, store });
    }

    expect(await canSendLens(userId, { now: beforeMidnight, store })).toBe(
      false,
    );
    expect(await canSendLens(userId, { now: midnight, store })).toBe(true);

    const quota = await getLensQuota(userId, { now: midnight, store });
    expect(quota).toEqual({
      day: "2026-07-30",
      used: 0,
      limit: FREE_LENS_DAILY_LIMIT,
      remaining: FREE_LENS_DAILY_LIMIT,
      resetAt: "2026-07-31T00:00:00.000Z",
    });
  });
});

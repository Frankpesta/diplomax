import { describe, it, expect, beforeEach } from "vitest";
import { allowRequest, type RateLimitStore } from "@/lib/rate-limit";

// Use an injected store per test suite so tests are isolated
function makeStore(): RateLimitStore {
  const map = new Map<string, { count: number; resetAt: number }>();
  return {
    get: (k) => map.get(k),
    set: (k, v) => { map.set(k, v); },
  };
}

const BASE_NOW = 1_700_000_000_000; // fixed timestamp for deterministic tests

describe("allowRequest — basic rate limiting", () => {
  it("allows the first request from a new IP", () => {
    const store = makeStore();
    expect(allowRequest("1.2.3.4", { now: BASE_NOW, store })).toBe(true);
  });

  it("allows up to the default limit (5) requests", () => {
    const store = makeStore();
    const results = Array.from({ length: 5 }, (_, i) =>
      allowRequest("1.2.3.4", { now: BASE_NOW + i, store })
    );
    expect(results.every(Boolean)).toBe(true);
  });

  it("blocks the 6th request within the window", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) {
      allowRequest("1.2.3.4", { now: BASE_NOW, store });
    }
    expect(allowRequest("1.2.3.4", { now: BASE_NOW + 1, store })).toBe(false);
  });

  it("does not block a different IP after the first is exhausted", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) {
      allowRequest("bad-ip", { now: BASE_NOW, store });
    }
    expect(allowRequest("good-ip", { now: BASE_NOW, store })).toBe(true);
  });
});

describe("allowRequest — window reset", () => {
  it("allows requests again after the window expires", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) {
      allowRequest("1.2.3.4", { now: BASE_NOW, store });
    }
    // 6th within window — blocked
    expect(allowRequest("1.2.3.4", { now: BASE_NOW + 1, store })).toBe(false);
    // After window (60_001 ms later) — allowed again
    const afterWindow = BASE_NOW + 60_001;
    expect(allowRequest("1.2.3.4", { now: afterWindow, store })).toBe(true);
  });

  it("counter resets to 1 (not 0) after the window expires", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) {
      allowRequest("1.2.3.4", { now: BASE_NOW, store });
    }
    // The first request in a new window counts as 1
    allowRequest("1.2.3.4", { now: BASE_NOW + 60_001, store });
    // Can still make 4 more (total limit = 5)
    for (let i = 0; i < 4; i++) {
      expect(allowRequest("1.2.3.4", { now: BASE_NOW + 60_002 + i, store })).toBe(true);
    }
    // 6th in new window — blocked
    expect(allowRequest("1.2.3.4", { now: BASE_NOW + 60_010, store })).toBe(false);
  });
});

describe("allowRequest — custom limits", () => {
  it("respects a custom limit of 1", () => {
    const store = makeStore();
    expect(allowRequest("ip", { limit: 1, now: BASE_NOW, store })).toBe(true);
    expect(allowRequest("ip", { limit: 1, now: BASE_NOW + 1, store })).toBe(false);
  });

  it("respects a custom limit of 10", () => {
    const store = makeStore();
    const results = Array.from({ length: 10 }, (_, i) =>
      allowRequest("ip", { limit: 10, now: BASE_NOW + i, store })
    );
    expect(results.every(Boolean)).toBe(true);
    expect(allowRequest("ip", { limit: 10, now: BASE_NOW + 11, store })).toBe(false);
  });

  it("respects a custom window of 5 seconds", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) {
      allowRequest("ip", { windowMs: 5_000, now: BASE_NOW, store });
    }
    expect(allowRequest("ip", { windowMs: 5_000, now: BASE_NOW + 5_001, store })).toBe(true);
  });
});

describe("allowRequest — edge cases", () => {
  it("treats each unique key independently", () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) allowRequest("a", { now: BASE_NOW, store });
    for (let i = 0; i < 3; i++) allowRequest("b", { now: BASE_NOW, store });

    expect(allowRequest("a", { now: BASE_NOW, store })).toBe(false);
    expect(allowRequest("b", { now: BASE_NOW, store })).toBe(true);
  });

  it("allows exactly limit=5 and blocks on limit+1", () => {
    const store = makeStore();
    const LIMIT = 5;
    for (let i = 0; i < LIMIT; i++) {
      expect(allowRequest("ip", { limit: LIMIT, now: BASE_NOW, store })).toBe(true);
    }
    expect(allowRequest("ip", { limit: LIMIT, now: BASE_NOW, store })).toBe(false);
  });
});

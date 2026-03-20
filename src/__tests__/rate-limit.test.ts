import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset by using unique keys per test
  });

  it("allows requests within limit", () => {
    const key = `test-allow-${Date.now()}`;
    const r1 = rateLimit(key, 3, 60000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, 3, 60000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks requests exceeding limit", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);

    const r3 = rateLimit(key, 2, 60000);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const key = `test-reset-${Date.now()}`;
    rateLimit(key, 1, 100); // 100ms window
    const blocked = rateLimit(key, 1, 100);
    expect(blocked.success).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 150));

    const allowed = rateLimit(key, 1, 100);
    expect(allowed.success).toBe(true);
  });

  it("tracks different keys independently", () => {
    const key1 = `test-key1-${Date.now()}`;
    const key2 = `test-key2-${Date.now()}`;

    rateLimit(key1, 1, 60000);
    const blocked = rateLimit(key1, 1, 60000);
    expect(blocked.success).toBe(false);

    const allowed = rateLimit(key2, 1, 60000);
    expect(allowed.success).toBe(true);
  });
});

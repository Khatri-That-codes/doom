import { describe, expect, it } from "vitest";
import { DailyDropEngine } from "./daily-drop-engine.js";
import { InMemoryStore } from "../store/in-memory-store.js";

describe("DailyDropEngine", () => {
  it("uses the local calendar date and returns the same drop for that date", () => {
    const engine = new DailyDropEngine(new InMemoryStore());
    const date = new Date(2026, 10, 14, 0, 30);

    const first = engine.getOrCreate(date);
    const second = engine.getOrCreate(new Date(2026, 10, 14, 23, 59));

    expect(first.releaseDate).toBe("2026-11-14");
    expect(second).toBe(first);
  });
});

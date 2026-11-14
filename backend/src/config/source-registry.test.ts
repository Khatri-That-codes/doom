import { describe, expect, it } from "vitest";
import { loadFeedSources } from "./source-registry.js";

describe("source registry", () => {
  it("loads all configured regions and normalizes their categories", () => {
    const sources = loadFeedSources();

    expect(sources).toHaveLength(23);
    expect(new Set(sources.map((source) => source.category))).toEqual(
      new Set(["trending", "tech", "world", "science"])
    );
    expect(sources.every((source) => source.pollIntervalMinutes > 0)).toBe(true);
    expect(sources.some((source) => source.name === "ABC News Australia")).toBe(true);
    expect(sources.some((source) => source.name === "The Fiji Times")).toBe(true);
  });
});

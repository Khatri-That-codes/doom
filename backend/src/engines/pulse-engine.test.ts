import { describe, expect, it } from "vitest";
import type { Story } from "../domain/types.js";
import { InMemoryStore } from "../store/in-memory-store.js";
import { PulseEngine } from "./pulse-engine.js";

describe("PulseEngine", () => {
  it("creates a bounded card summary and persists the card", () => {
    const store = new InMemoryStore();
    const engine = new PulseEngine(store);
    const story: Story = {
      id: "story_1",
      title: "A headline",
      summary: Array.from({ length: 100 }, (_, index) => `word${index}`).join(" "),
      url: "https://example.com/story",
      source: "Example",
      category: "tech",
      publishedAt: "2026-01-01T00:00:00.000Z",
      tickers: [],
      sourceCount: 1
    };

    const card = engine.createCard(story, "AI");

    expect(card.summary.split("")).toHaveLength(card.summary.length);
    expect(card.summary.split(/\s+/)).toHaveLength(80);
    expect(store.getPulseCards()).toEqual([card]);
  });
});

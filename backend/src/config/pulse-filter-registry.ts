import { readFileSync } from "node:fs";
import { z } from "zod";
import type { PulseFilters, Story, StoryCategory } from "../domain/types.js";
import { loadStoryCategories } from "./category-registry.js";

const filtersSchema = z.object({
  version: z.string(),
  interests: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["topic", "ticker"]).optional(),
    categoryId: z.string().min(1).optional(),
    keywords: z.array(z.string().min(1))
  }))
});

export function loadPulseFilters(): PulseFilters {
  const filters = filtersSchema.parse(
    JSON.parse(readFileSync(new URL("../../config/pulse-filters.json", import.meta.url), "utf8"))
  );
  return { categories: loadStoryCategories(), interests: filters.interests };
}

function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function tagStory(story: Pick<Story, "title" | "summary" | "category" | "tickers">, filters = loadPulseFilters()): string[] {
  const text = `${story.title} ${story.summary}`;
  const tags = new Set<string>([story.category, ...story.tickers]);

  for (const interest of filters.interests) {
    if (interest.keywords.some((keyword) => matchesKeyword(text, keyword))) {
      tags.add(interest.id);
    }
  }

  return [...tags];
}

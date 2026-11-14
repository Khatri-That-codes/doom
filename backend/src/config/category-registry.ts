import { readFileSync } from "node:fs";
import { z } from "zod";
import type { StoryCategory, StoryCategoryDefinition } from "../domain/types.js";

const categorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  slot: z.number().int().positive().optional(),
  oreAccent: z.string().min(1).optional(),
  description: z.string().optional(),
  aliases: z.array(z.string().min(1)).optional()
});

const registrySchema = z.object({
  version: z.string(),
  categories: z.array(categorySchema).min(1)
});

export function loadStoryCategories(): StoryCategoryDefinition[] {
  const registry = registrySchema.parse(
    JSON.parse(readFileSync(new URL("../../config/story-categories.json", import.meta.url), "utf8"))
  );
  return registry.categories;
}

export function categoryFromSourceLabel(sourceLabel: string, categories = loadStoryCategories()): StoryCategory {
  const normalized = sourceLabel.trim().toLowerCase();
  const match = categories.find((category) =>
    [category.id, category.label, ...(category.aliases ?? [])]
      .some((value) => value.toLowerCase() === normalized)
  );
  return match?.id ?? categories[0].id;
}

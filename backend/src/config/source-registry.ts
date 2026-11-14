import { readFileSync } from "node:fs";
import { z } from "zod";
import { categoryFromSourceLabel } from "./category-registry.js";
import type { FeedSource, StoryCategory } from "../domain/types.js";

const sourceSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  category: z.string().min(1),
  rss_url: z.string().url(),
  type: z.enum(["direct_rss", "direct_atom", "google_news_proxy"]),
  poll_interval_minutes: z.number().int().positive(),
  notes: z.string().optional()
});

const registrySchema = z.object({
  version: z.string(),
  last_updated: z.string(),
  regions: z.record(z.array(sourceSchema))
});

function readRegistry(): unknown {
  return JSON.parse(readFileSync(new URL("../../config/sources.json", import.meta.url), "utf8"));
}

export function loadFeedSources(): FeedSource[] {
  const registry = registrySchema.parse(readRegistry());
  const sources = Object.values(registry.regions).flat();

  return sources.map((source) => ({
    id: source.id,
    name: source.provider,
    url: source.rss_url,
    category: categoryFromSourceLabel(source.category),
    pollIntervalMinutes: source.poll_interval_minutes
  }));
}

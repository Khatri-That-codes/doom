import Parser from "rss-parser";
import { readFileSync } from "node:fs";
import { z } from "zod";
import type { DailyDrop } from "../domain/types.js";
import { InMemoryStore } from "../store/in-memory-store.js";

type FeedItem = Parser.Item & { contentSnippet?: string; description?: string };
type FeedLoader = () => Promise<FeedItem[]>;

const config = z.object({
  source: z.string().min(1),
  topicBadge: z.string().min(1),
  feedUrl: z.string().url()
}).parse(JSON.parse(readFileSync(new URL("../../config/daily-drop.json", import.meta.url), "utf8")));

export class DailyDropEngine {
  private readonly parser = new Parser();
  private readonly feedLoader: FeedLoader;

  public constructor(
    private readonly store: InMemoryStore,
    feedLoader?: FeedLoader
  ) {
    this.feedLoader = feedLoader ?? (async () => (await this.parser.parseURL(config.feedUrl)).items);
  }

  async getOrCreate(date = new Date()): Promise<DailyDrop> {
    const releaseDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
    const existing = this.store.getDailyDrop(releaseDate);
    if (existing) {
      return existing;
    }

    const items = (await this.feedLoader()).filter((item) => item.title && item.link);
    if (!items.length) {
      throw new Error(`Daily Drop feed returned no usable articles: ${config.feedUrl}`);
    }

    const article = items[this.dailyIndex(releaseDate, items.length)];
    const drop: DailyDrop = {
      id: `drop_${releaseDate}`,
      releaseDate,
      source: config.source,
      title: article.title?.trim() ?? "HowStuffWorks article",
      summary: (article.contentSnippet ?? article.content ?? article.description ?? "").trim(),
      url: article.link ?? config.feedUrl,
      publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : releaseDate
    };

    this.store.saveDailyDrop(drop);
    return drop;
  }

  private dailyIndex(date: string, itemCount: number): number {
    let hash = 0;
    for (const character of date) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }
    return hash % itemCount;
  }
}

import Parser from "rss-parser";
import { loadPulseFilters, tagStory } from "../config/pulse-filter-registry.js";
import type { FeedSource, Story } from "../domain/types.js";
import { InMemoryStore } from "../store/in-memory-store.js";

type FeedItem = Parser.Item & { contentSnippet?: string };

export class StoryIngestionEngine {
  private readonly parser = new Parser<Record<string, never>, FeedItem>();
  private readonly filters = loadPulseFilters();

  public constructor(private readonly store: InMemoryStore) {}

  async ingest(source: FeedSource): Promise<Story[]> {
    const feed = await this.parser.parseURL(source.url);
    const ingested: Story[] = [];

    for (const item of feed.items) {
      if (!item.title || !item.link || !item.pubDate) {
        continue;
      }

      const story: Story = {
        id: this.storyId(item.link),
        title: item.title.trim(),
        summary: (item.contentSnippet ?? item.content ?? "").trim(),
        url: item.link,
        source: source.name,
        category: source.category,
        publishedAt: new Date(item.pubDate).toISOString(),
        tickers: this.extractTickers(item.title),
        tags: tagStory({
          title: item.title.trim(),
          summary: (item.contentSnippet ?? item.content ?? "").trim(),
          category: source.category,
          tickers: this.extractTickers(item.title)
        }, this.filters),
        sourceCount: 1
      };

      this.store.saveStory(story);
      ingested.push(story);
    }

    return ingested;
  }

  private storyId(url: string): string {
    return `story_${Buffer.from(url).toString("base64url").slice(0, 24)}`;
  }

  private extractTickers(text: string): string[] {
    return [...text.matchAll(/\$([A-Z]{1,5})\b/g)].map((match) => match[1]);
  }
}

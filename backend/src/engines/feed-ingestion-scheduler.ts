import type { FeedSource } from "../domain/types.js";
import { StoryIngestionEngine } from "./story-ingestion-engine.js";

export class FeedIngestionScheduler {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private stopped = false;

  public constructor(
    private readonly engine: StoryIngestionEngine,
    private readonly sources: FeedSource[],
    private readonly log: { info: (context: object, message: string) => void; error: (context: object, message: string) => void }
  ) {}

  start(): void {
    this.stopped = false;
    for (const source of this.sources) {
      void this.ingestAndSchedule(source);
    }
    this.log.info({ sourceCount: this.sources.length }, "Feed ingestion scheduler started");
  }

  stop(): void {
    this.stopped = true;
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  private async ingestAndSchedule(source: FeedSource): Promise<void> {
    try {
      const stories = await this.engine.ingest(source);
      this.log.info({ source: source.name, storyCount: stories.length }, "Feed ingested");
    } catch (error) {
      this.log.error({ err: error, source: source.name, url: source.url }, "Feed ingestion failed");
    } finally {
      if (!this.stopped) {
        const delay = source.pollIntervalMinutes * 60 * 1000;
        this.timers.set(source.id, setTimeout(() => void this.ingestAndSchedule(source), delay));
      }
    }
  }
}

import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { DailyDropEngine } from "../engines/daily-drop-engine.js";
import { loadFeedSources } from "../config/source-registry.js";
import { loadStoryCategories } from "../config/category-registry.js";
import { loadPulseFilters } from "../config/pulse-filter-registry.js";
import { FeedIngestionScheduler } from "../engines/feed-ingestion-scheduler.js";
import { PulseEngine } from "../engines/pulse-engine.js";
import { StoryIngestionEngine } from "../engines/story-ingestion-engine.js";
import { InMemoryStore } from "../store/in-memory-store.js";

export function createServer(store = new InMemoryStore()) {
  const server = Fastify({ logger: true });
  const pulseEngine = new PulseEngine(store);
  const dailyDropEngine = new DailyDropEngine(store);
  const ingestionScheduler = new FeedIngestionScheduler(
    new StoryIngestionEngine(store),
    loadFeedSources(),
    {
      info: (context, message) => server.log.info(context, message),
      error: (context, message) => server.log.error(context, message)
    }
  );

  server.register(cors, { origin: true });

  server.get("/health", async () => ({ status: "ok" }));

  server.get("/api/stories", async (request, reply) => {
    const parsed = z.string().min(1).optional().safeParse((request.query as { category?: string }).category);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid category" });
    }
    if (parsed.data && !loadStoryCategories().some((category) => category.id === parsed.data)) {
      return reply.code(400).send({ error: "Invalid category" });
    }
    return { stories: store.getStories(parsed.data) };
  });

  server.get("/api/pulse", async () => ({ cards: store.getPulseCards() }));

  server.get("/api/pulse/filters", async () => loadPulseFilters());

  server.post("/api/pulse/cards", async (request, reply) => {
    const body = z.object({ storyId: z.string(), interest: z.string().min(1) }).safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "storyId and interest are required" });
    }

    const story = store.getStories().find((candidate) => candidate.id === body.data.storyId);
    if (!story) {
      return reply.code(404).send({ error: "Story not found" });
    }
    return reply.code(201).send({ card: pulseEngine.createCard(story, body.data.interest) });
  });

  server.get("/api/daily-drop", async () => ({ drop: dailyDropEngine.getOrCreate() }));

  server.addHook("onReady", async () => ingestionScheduler.start());
  server.addHook("onClose", async () => ingestionScheduler.stop());

  return server;
}

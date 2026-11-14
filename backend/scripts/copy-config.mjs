import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/config", { recursive: true });
await cp("config/sources.json", "dist/config/sources.json");
await cp("config/pulse-filters.json", "dist/config/pulse-filters.json");
await cp("config/story-categories.json", "dist/config/story-categories.json");

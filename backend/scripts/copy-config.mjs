import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/config", { recursive: true });
await cp("config/sources.json", "dist/config/sources.json");

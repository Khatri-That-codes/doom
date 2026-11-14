import { createServer } from "./api/server.js";

const port = Number(process.env.PORT ?? 4000);
const server = createServer();

server.listen({ host: "0.0.0.0", port }).catch((error) => {
  server.log.error(error);
  process.exit(1);
});

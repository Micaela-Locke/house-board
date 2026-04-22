import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/api/health", (c) => c.json({ ok: true }));

export const handler = handle(app);
export { app };

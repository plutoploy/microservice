import { Hono } from "hono";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { deployRoutes } from "./src/routes/deployRoutes";
import { openapiSpec } from "./src/routes/openapi";

const app = new Hono();

app.use("*", cors());

app.route("/api", deployRoutes);

// Raw OpenAPI JSON endpoint
app.get("/swagger.json", (c) => {
  return c.json(openapiSpec);
});

// Interactive Swagger UI documentation
app.get("/docs", swaggerUI({ url: "/swagger.json" }));

app.get("/", (c) => {
  return c.json({
    message: "Deployment Platform API",
    status: "running",
    version: "1.0.0",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

export default {
  port: 3000,
  fetch: app.fetch,
};

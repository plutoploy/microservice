export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Plutoploy API",
    version: "1.0.0",
    description:
      "API documentation for the Plutoploy Deployment Platform, managing Podman containers, Docker images, and reverse proxy routes.",
  },
  servers: [
    {
      url: "/",
      description: "Current Host",
    },
  ],
  tags: [
    { name: "Root & Health", description: "Base API information and health checks" },
    { name: "Images", description: "Operations related to container images" },
    { name: "Containers", description: "Container lifecycle management" },
    { name: "Routes", description: "Reverse proxy route mapping" },
    { name: "System", description: "Podman system-wide settings and info" },
  ],
  paths: {
    "/": {
      get: {
        summary: "Get API status",
        description: "Returns the status and version of the Plutoploy Deployment Platform API.",
        tags: ["Root & Health"],
        responses: {
          200: {
            description: "API status retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Deployment Platform API" },
                    status: { type: "string", example: "running" },
                    version: { type: "string", example: "1.0.0" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "API health check",
        description: "Standard health check endpoint to verify that the service is running.",
        tags: ["Root & Health"],
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/pull": {
      post: {
        summary: "Pull an image",
        description:
          "Pulls a container image from a remote registry (e.g. Docker Hub) into the local Podman store.",
        tags: ["Images"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    description: "Name of the container image to pull",
                    example: "nginx",
                  },
                  tag: {
                    type: "string",
                    description: "Image tag to pull",
                    default: "latest",
                    example: "alpine",
                  },
                  tlsVerify: {
                    type: "boolean",
                    description: "Whether to verify TLS certificates of the registry",
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image pulled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Image pulled successfully" },
                    image: {
                      type: "object",
                      description: "Pulled image details",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input / Missing required fields",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Image name is required" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error pulling image" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/images": {
      get: {
        summary: "List pulled images",
        description: "Retrieves a list of all container images currently stored locally in Podman.",
        tags: ["Images"],
        responses: {
          200: {
            description: "A list of images",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    images: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "sha256:d85d07c0..." },
                          tags: {
                            type: "array",
                            items: { type: "string" },
                            example: ["docker.io/library/nginx:latest"],
                          },
                          labels: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error listing images" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/images/{name}": {
      get: {
        summary: "Inspect an image",
        description: "Get detailed information about a specific local container image.",
        tags: ["Images"],
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            description: "Image name or ID",
            schema: { type: "string" },
            example: "nginx",
          },
        ],
        responses: {
          200: {
            description: "Image details retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    image: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "sha256:d85d07c0..." },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                        },
                        labels: {
                          type: "object",
                          additionalProperties: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error inspecting image" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Remove an image",
        description: "Removes a local container image by its name or ID.",
        tags: ["Images"],
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            description: "Image name or ID to remove",
            schema: { type: "string" },
            example: "nginx",
          },
        ],
        responses: {
          200: {
            description: "Image removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Image removed" },
                    name: { type: "string", example: "nginx" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error removing image" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/deploy": {
      post: {
        summary: "Deploy a container",
        description:
          "Pulls the specified image (if needed), creates a container, starts it, and returns container details.",
        tags: ["Containers"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    description: "Container image name to deploy",
                    example: "nginx",
                  },
                  name: {
                    type: "string",
                    description: "Optional custom name for the container",
                    example: "web-server",
                  },
                  tag: {
                    type: "string",
                    description: "Image tag",
                    default: "latest",
                    example: "alpine",
                  },
                  command: {
                    type: "array",
                    description: "Optional custom command to execute inside the container",
                    items: { type: "string" },
                    example: ["nginx", "-g", "daemon off;"],
                  },
                  portMappings: {
                    type: "array",
                    description: "Optional port mappings",
                    items: {
                      type: "object",
                      properties: {
                        hostPort: { type: "integer", example: 8080 },
                        containerPort: { type: "integer", example: 80 },
                      },
                    },
                  },
                  environment: {
                    type: "object",
                    description: "Optional environment variables",
                    additionalProperties: { type: "string" },
                    example: { PORT: "80", NODE_ENV: "production" },
                  },
                  labels: {
                    type: "object",
                    description: "Optional container labels",
                    additionalProperties: { type: "string" },
                    example: { app: "frontend" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Container deployed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Container deployed successfully" },
                    container: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "abc123xyz..." },
                        name: { type: "string", example: "/web-server" },
                        image: { type: "string", example: "docker.io/library/nginx:latest" },
                        status: { type: "string", example: "running" },
                        ports: {
                          type: "object",
                          description: "Port bindings",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Image name is required" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error deploying container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers": {
      get: {
        summary: "List all containers",
        description: "Retrieves a list of all containers (both running and stopped).",
        tags: ["Containers"],
        responses: {
          200: {
            description: "List of containers",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    containers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "abc123xyz..." },
                          name: { type: "string", example: "web-server" },
                          status: { type: "string", example: "running" },
                          labels: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                          ports: {
                            type: "array",
                            items: { type: "object" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error listing containers" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}": {
      get: {
        summary: "Inspect a container",
        description: "Retrieves low-level inspect information for a specific container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container inspect details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    container: {
                      type: "object",
                      description: "Detailed container inspection object",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error inspecting container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Remove a container",
        description:
          "Forcefully removes a container from Podman and deletes any associated route mappings.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name to remove",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Container removed" },
                    id: { type: "string", example: "abc123xyz" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error removing container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}/logs": {
      get: {
        summary: "Get container logs",
        description: "Retrieves stdout and stderr logs for a specific container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
          {
            name: "tail",
            in: "query",
            required: false,
            description: "Number of log lines to return from the end",
            schema: { type: "integer", default: 100 },
            example: 50,
          },
        ],
        responses: {
          200: {
            description: "Container logs retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "abc123xyz" },
                    logs: {
                      type: "array",
                      description: "Array of log messages",
                      items: { type: "string" },
                      example: ["[info] starting nginx", "[info] ready for connections"],
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error fetching logs" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}/stats": {
      get: {
        summary: "Get container stats",
        description:
          "Retrieves live resource usage statistics (CPU, memory, networking) for a specific container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container stats retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "abc123xyz" },
                    stats: {
                      type: "object",
                      description: "Podman container resource usage stats",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error fetching stats" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}/start": {
      post: {
        summary: "Start a container",
        description: "Starts a stopped container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container started successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Container started" },
                    id: { type: "string", example: "abc123xyz" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error starting container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}/stop": {
      post: {
        summary: "Stop a container",
        description: "Stops a running container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container stopped successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Container stopped" },
                    id: { type: "string", example: "abc123xyz" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error stopping container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/containers/{id}/restart": {
      post: {
        summary: "Restart a container",
        description: "Restarts a running or stopped container.",
        tags: ["Containers"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Container ID or name",
            schema: { type: "string" },
            example: "abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Container restarted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Container restarted" },
                    id: { type: "string", example: "abc123xyz" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error restarting container" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/routes": {
      get: {
        summary: "List all route mappings",
        description:
          "Retrieves a list of all configured reverse proxy routes from the SQLite database.",
        tags: ["Routes"],
        responses: {
          200: {
            description: "List of routes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    routes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          route: { type: "string", example: "my-app.localhost" },
                          container: { type: "string", example: "abc123xyz" },
                          port: { type: "integer", example: 80 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error listing routes" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Add a route mapping",
        description:
          "Creates a new reverse proxy route mapping container port to a specific routing hostname/path.",
        tags: ["Routes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["route", "container", "port"],
                properties: {
                  route: {
                    type: "string",
                    description: "Domain name or path for routing",
                    example: "my-app.localhost",
                  },
                  container: {
                    type: "string",
                    description: "Target container ID or name",
                    example: "abc123xyz",
                  },
                  port: {
                    type: "integer",
                    description: "Target port inside the container",
                    example: 80,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Route mapping added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Route added" },
                    route: { type: "string", example: "my-app.localhost" },
                    container: { type: "string", example: "abc123xyz" },
                    port: { type: "integer", example: 80 },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "route, container, and port are required" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error adding route" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/routes/{id}": {
      delete: {
        summary: "Remove a route mapping",
        description: "Deletes a reverse proxy route mapping by database row ID.",
        tags: ["Routes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Database row ID of the route to remove",
            schema: { type: "string" },
            example: "1",
          },
        ],
        responses: {
          200: {
            description: "Route mapping removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Route removed" },
                    id: { type: "string", example: "1" },
                  },
                },
              },
            },
          },
          404: {
            description: "Route mapping not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Route not found" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error removing route" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/system/info": {
      get: {
        summary: "Get system info",
        description:
          "Retrieves metadata and status information about the host system's Podman installation.",
        tags: ["System"],
        responses: {
          200: {
            description: "System information retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    info: {
                      type: "object",
                      description: "Metadata object describing the host's Podman configuration",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error fetching system info" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/prune": {
      post: {
        summary: "Prune system resources",
        description:
          "Removes unused data: stopped containers, unused networks, dangling images, and build caches.",
        tags: ["System"],
        responses: {
          200: {
            description: "Pruning completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Prune completed" },
                    result: {
                      type: "object",
                      description: "Details of reclaimed space/resources",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Error pruning" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

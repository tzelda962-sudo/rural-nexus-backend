import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerSwagger(
  fastify: FastifyInstance<any, any, any, any>,
): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "NGO Platform API",
        description: "Backend API for the NGO donation, volunteer, and campaign management platform.",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:10000", description: "Local development" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      tags: [
        { name: "Auth", description: "Authentication & authorization" },
        { name: "Donations", description: "Donation intents, confirmations, history" },
        { name: "Campaigns", description: "Campaign management & impact metrics" },
        { name: "Volunteers", description: "Volunteer registration, search, assignments" },
        { name: "Events", description: "Event management & attendee registration" },
        { name: "Reports", description: "Report generation & status" },
        { name: "Donors", description: "Donor profiles & communication preferences" },
        { name: "Beneficiaries", description: "Beneficiary enrollment & programs" },
        { name: "Webhooks", description: "Payment provider webhooks" },
        { name: "Admin", description: "Admin operations (roles, audit)" },
        { name: "System", description: "Health checks & meta" },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      persistAuthorization: true,
    },
  });
}

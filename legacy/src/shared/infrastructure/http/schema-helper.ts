import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function zodJson(schema: z.ZodTypeAny): unknown {
  // @ts-expect-error zodToJsonSchema deep instantiation
  return zodToJsonSchema(schema, { target: "openApi3" });
}

import { z } from "zod";

const positiveIdSchema = z.coerce.number().int().positive();

export function parsePositiveId(value: string | undefined): number | null {
  const result = positiveIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

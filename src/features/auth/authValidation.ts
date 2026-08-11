import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address.");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password is too long.");
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required.")
  .max(60, "Display name must be at most 60 characters.");

export function firstValidationError(result: {
  success: false;
  error: z.ZodError;
}) {
  return result.error.issues[0]?.message || "Check the entered data.";
}

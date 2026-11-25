import { z } from "zod";

export const authEmailSchema = z.string().trim().email("Enter a valid email address.");

export const authPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.");

export const loginPasswordSchema = z.string().min(1, "Please enter your password.");

export const registerInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Full name must be 100 characters or fewer."),
  email: authEmailSchema,
  mobile: z.string().trim().refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    },
    "Please enter a valid mobile number.",
  ),
  password: authPasswordSchema,
});

export function firstValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the entered account details.";
}

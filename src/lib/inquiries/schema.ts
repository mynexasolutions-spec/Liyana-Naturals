import { z } from "zod";

export const inquiryCreateSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  subject: z.string().trim()
    .min(1, "Please select a subject.")
    .max(160)
    .refine((value) => value !== "Select a Subject", "Please select a subject."),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000),
}).strict();

export type InquiryCreatePayload = z.infer<typeof inquiryCreateSchema>;

import { z } from "zod";

const optionalTrimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().min(min).max(max).optional());

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  firstName: optionalTrimmedString(1, 100),
  lastName: optionalTrimmedString(1, 100),
  phone: optionalTrimmedString(5, 30),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1).max(128),
  redirectTo: z.string().trim().min(1).default("/"),
});

export type LoginInput = z.infer<typeof loginSchema>;

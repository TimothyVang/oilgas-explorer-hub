import { z } from "zod";

/**
 * Common validation schemas for forms throughout the application
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password validation for login
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters");

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

// Phone validation (optional but must be valid format if provided)
export const phoneSchema = z
  .string()
  .regex(
    /^$|^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    "Please enter a valid phone number"
  )
  .optional()
  .or(z.literal(""));

// Company name validation (optional)
export const companyNameSchema = z
  .string()
  .max(200, "Company name must be less than 200 characters")
  .optional()
  .or(z.literal(""));

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Signup form schema
export const signupSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Profile form schema
export const profileSchema = z.object({
  fullName: nameSchema.optional().or(z.literal("")),
  companyName: companyNameSchema,
  phone: phoneSchema,
});

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password form schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Helper function to extract field errors from Zod validation
 */
export function getFieldErrors(
  error: z.ZodError
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      errors[err.path[0].toString()] = err.message;
    }
  });
  return errors;
}

/**
 * Validate a form and return errors by field
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string | undefined> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: getFieldErrors(result.error) };
}

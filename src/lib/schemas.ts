import { z } from "zod";

// Login Form Schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/\S/, "Username cannot be only whitespace"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/\S/, "Password cannot be only whitespace"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Create Task Schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .regex(/\S/, "Title cannot be only whitespace")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

// Edit Task Schema
export const editTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .regex(/\S/, "Title cannot be only whitespace")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export type EditTaskFormData = z.infer<typeof editTaskSchema>;

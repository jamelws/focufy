import { object, string } from "zod"
 
export const loginSchema = object({
  email: string()
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})
export const registerSchema = object({
  email: string()
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: string()
    .min(1, "Confirm Password is required")
    .min(8, "Confirm Password must be more than 8 characters"),
  name: string()
    .min(1, "Name is required")
    .min(2, "Name must be more than 2 characters")
    .max(32, "Name must be less than 32 characters"),
  
})
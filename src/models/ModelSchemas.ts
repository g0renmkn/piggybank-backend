import { z } from "zod";

// Schema for bank account validation
export const bankAccountSchema = z.object({
    name: z
        .string()
        .max(30, "Account 'name' is too long (max=30)"),
    iban: z
        .string()
        .max(34, "Account 'IBAN' is too long (max=34)"),
    closed: z
        .string()
        .datetime("Date must follow the 'YYYY-MM-DDTHH:MM:SS.uuuZ format'")
        .nullish()
        .or(z.string().max(0))
        .default(""),
    comments: z
        .string()
        .max(200, "Account 'comments' is too long (max=200)")
        .optional()
        .default(""),
    pfp: z
        .string()
        .max(50, "Account 'pfp' is too long (max=20)")
        .optional()
        .default(""),
});

// Schema for an array of bank accounts
export const bankAccountArraySchema = z
    .array(bankAccountSchema)
    .nonempty("Data empty");

// Schema for bank category validation
export const bankCategorySchema = z.object({
    name: z
        .string()
        .max(30, "Category 'name' is too long (max=30)"),
    description: z
        .string()
        .max(200, "Category 'description' is too long (max=200)")
        .optional()
        .default(""),
    icon: z
        .string()
        .max(100, "Category 'icon' is too long (max=100)")
        .optional()
        .default(""),
});

// Schema for an array of bank categories
export const bankCategoryArraySchema = z
    .array(bankCategorySchema)
    .nonempty("Data empty");


// Schema for bank movement validation
export const bankMovementSchema = z.object({
    acc_id: z.number().positive("Account ID must be a positive number"),
    date: z
        .string()
        .datetime("Date must follow the 'YYYY-MM-DDTHH:MM:SS.uuuZ format'"),
    category: z.number().positive("Category ID must be a positive number"),
    description: z
        .string()
        .max(100, "Description is too long (max=100)")
        .optional()
        .default(""),
    value: z
        .number(),
    periodicity: z
        .number()
        .positive("Periodicity must be a positive number")
        .default(1),
    notes: z
        .string()
        .max(200, "Notes are too long (max=200)")
        .optional()
        .default(""),
});

// Schema for an array of bank movements
export const bankMovementArraySchema = z
    .array(bankMovementSchema)
    .nonempty("Data empty");
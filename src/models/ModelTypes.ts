import { z } from "zod";
import { 
    bankAccountSchema,
    bankCategorySchema
} from "./ModelSchemas";


// Infer type based on Schema
export type BankAccountType = z.infer<typeof bankAccountSchema>;

// Extended type to include "id"
export type BankAccountTypeExt = {"id": number} & BankAccountType;

// Infer type based on Schema
export type BankCategoryType = z.infer<typeof bankCategorySchema>;

// Extended type to include "id"
export type BankCategoryTypeExt = {"id": number} & BankCategoryType;

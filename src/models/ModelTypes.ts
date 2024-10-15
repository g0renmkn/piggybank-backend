import { z } from "zod";
import { 
    bankAccountSchema,
    bankAccountArraySchema
} from "./ModelSchemas";


// Infer type based on Schema
export type BankAccountType = z.infer<typeof bankAccountSchema>;

// Extended type to include "id"
export type BankAccountTypeExt = {"id": number} & BankAccountType;

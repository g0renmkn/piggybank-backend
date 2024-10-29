import { z } from "zod";
import { 
    bankAccountSchema,
    bankCategorySchema,
    bankMovementSchema
} from "./ModelSchemas";

// Data type used in every simple table
export type SimpleTableType = {
    id: number;
    name: string;
}

// Infer type based on Schema
export type BankAccountType = z.infer<typeof bankAccountSchema>;

// Extended type to include "id"
export type BankAccountTypeExt = {"id": number} & BankAccountType;

// Infer type based on Schema
export type BankCategoryType = z.infer<typeof bankCategorySchema>;

// Extended type to include "id"
export type BankCategoryTypeExt = {"id": number} & BankCategoryType;

// Infer type based on Schema
type BankMovementType = z.infer<typeof bankMovementSchema>;

// Modify base type to create valid bank movement output type
// (Omit "category" and "periodicity" from base type and add them as objects)
export type BankMovementTypeExt = Omit<BankMovementType, "category" | "periodicity"> & {
    id: number;
    category: SimpleTableType;
    periodicity: SimpleTableType;
};


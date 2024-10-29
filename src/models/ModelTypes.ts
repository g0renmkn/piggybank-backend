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

// Infer type based on Schema for inputting data
export type BankAccountTypeIn = z.infer<typeof bankAccountSchema>;

// Extended type to include "id" for outputting data
export type BankAccountTypeOut = {"id": number} & BankAccountTypeIn;

// Infer type based on Schema for inputting data
export type BankCategoryTypeIn = z.infer<typeof bankCategorySchema>;

// Extended type to include "id" for outputting data
export type BankCategoryTypeOut = {"id": number} & BankCategoryTypeIn;

// Infer type based on Schema for inputting data
export type BankMovementTypeIn = z.infer<typeof bankMovementSchema>;

// Modify base type to create valid bank movement output type
// (Omit "category" and "periodicity" from base type and add them as objects)
export type BankMovementTypeOut = Omit<BankMovementTypeIn, "category" | "periodicity"> & {
    id: number;
    category: SimpleTableType;
    periodicity: SimpleTableType;
};


import { z } from "zod";

// Schema for bank account validation
export const bankAccountSchema = z.object({
    name: z
        .string()
        .max(20, "Account 'name' is too long (max=20)"),
    iban: z
        .string()
        .max(24, "Account 'IBAN' is too long (max=24)"),
    closed: z
        .string()
        .datetime("Date must follow the 'YYYY-MM-DDTHH:MM:SS.uuuZ format'")
        .nullish()
        .or(z.string().max(0, "What the fuck are you doing?"))
        .default(""),
    comments: z
        .string()
        .optional()
        .default("")
})

// Schema for an array of bank accounts
export const bankAccountArraySchema = z.array(bankAccountSchema);

// Infer type based on Schema
export type BankAccountType = z.infer<typeof bankAccountSchema>;

// Extended type to include "id"
export type BankAccountTypeExt = {"id": number} & BankAccountType;


/**
 * PiggybankModel
 * 
 * Piggybank data model object
 */
export interface PiggybankModel {
    /**
         * Get static table of Movement Types
         * 
         * @returns Array of possible values
         */
    getMovementTypes(): string[];

    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities(): string[];

    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getAssetTypes(): string[];

    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts(): BankAccountTypeExt[];

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount(acc: BankAccountType[]): BankAccountTypeExt[];

    /**
     * Update an existing bank account
     * 
     * @param id ID of the account to be updated
     * @param data Account data to be updated
     * 
     * @returns An updated account object
     */
    updateBankAccount(id: number, data: Partial<BankAccountType>): BankAccountTypeExt;

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns Data of the deleted bank account
     */
    deleteBankAccount(id: number): BankAccountTypeExt;
}
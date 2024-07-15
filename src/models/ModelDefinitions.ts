import { z } from "zod";

// Schema for bank account validation
export const bankAccountSchema = z.object({
    name: z.string(),
    iban: z.string(),
    closed: z.string(),
    comments: z.string()
})

// Infer type based on Schema
export type BankAccountType = z.infer<typeof bankAccountSchema>;

// Extended type to include "id" 
export type BankAccountTypeExt = {
    "id": number;
    "name": string;
    "iban": string;
    "closed": string;
    "comments": string;
}

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
    createBankAccount(acc: BankAccountType): BankAccountTypeExt;

    /**
     * Update an existing bank account
     * 
     * @param id ID of the account to be updated
     * @param data Account data to be updated
     * 
     * @returns An updated account object
     */
    updateBankAccount(id: number, data: BankAccountType): BankAccountTypeExt;

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns True if the account has been correctly deleted
     */
    deleteBankAccount(id: number): boolean;
}
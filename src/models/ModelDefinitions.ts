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
})

// Schema for an array of bank accounts
export const bankAccountArraySchema = z
    .array(bankAccountSchema)
    .nonempty("Data empty");

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
     * Initialize the data model
     * 
     * @returns Promise that resolves when initialization is complete
     */
    initModel(): Promise<void>;

    /** -------- Common Data ---------- */

    /**
     * Get static table of Movement Types
     * 
     * @returns Array of possible values
     */
    getCommonMovTypes(): Promise<string[]>;

    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getCommonAssetTypes(): Promise<string[]>;

    /** -------- Banks Management ---------- */

    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities(): Promise<string[]>;

    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts(): Promise<BankAccountTypeExt[]>;

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount(acc: BankAccountType[]): Promise<BankAccountTypeExt[]>;

    /**
     * Update an existing bank account
     * 
     * @param id ID of the account to be updated
     * @param data Account data to be updated
     * 
     * @returns An updated account object
     */
    updateBankAccount(id: number, data: Partial<BankAccountType>): Promise<BankAccountTypeExt>;

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns Data of the deleted bank account
     */
    deleteBankAccount(id: number): Promise<BankAccountTypeExt>;


    /**
     * Delete all existing bank accounts
     */
    deleteAllBankAccounts(): Promise<void>;


    /**
     * Clear all data from the data model
     */
    clearAllData(): Promise<void>;
}
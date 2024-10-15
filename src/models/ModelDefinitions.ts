import { z } from "zod";
import { 
    bankAccountSchema,
    bankAccountArraySchema
} from "./ModelSchemas";
import {
    type BankAccountType,
    type BankAccountTypeExt
} from "./ModelTypes";


export { bankAccountSchema };
export { bankAccountArraySchema };
export { type BankAccountType };
export { type BankAccountTypeExt };


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
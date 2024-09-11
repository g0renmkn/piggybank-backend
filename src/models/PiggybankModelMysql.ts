import { type BankAccountType, type BankAccountTypeExt, type PiggybankModel } from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


/**
 * Piggybank Model class
 */
export class PiggybankModelMysql implements PiggybankModel {
    constructor(modelOpts?: object) {
        throw Error("Not implemented");
    }


    /**
     * Get static table of Movement Types
     * 
     * @returns Array of possible values
     */
    getMovementTypes = (): string[] => {
        throw Error("Not implemented");
    }


    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities = (): string[] => {
        throw Error("Not implemented");
    }


    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getAssetTypes = (): string[] => {
        throw Error("Not implemented");
    }


    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts = (): BankAccountTypeExt[] => {
        throw Error("Not implemented");
    }

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount = (acc: BankAccountType[]): BankAccountTypeExt[] => {
        throw Error("Not implemented");
    }

    /**
     * Update an existing bank account
     * 
     * @param id ID of the account to be updated
     * @param data Account data to be updated
     * 
     * @returns An updated account object
     */
    updateBankAccount = (id: number, data: Partial<BankAccountType>): BankAccountTypeExt => {
        throw Error("Not implemented");
    }

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns The deleted account object data
     */
    deleteBankAccount = (id: number): BankAccountTypeExt => {
        throw Error("Not implemented");
    }

    /**
     * Delete all existing bank accounts
     */
    deleteAllAccounts(): void {
        throw Error("Not implemented");
    }
}

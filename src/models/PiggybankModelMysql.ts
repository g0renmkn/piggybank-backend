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
    getMovementTypes = async (): Promise<string[]> => {
        throw Error("Not implemented");
    }


    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities = async (): Promise<string[]> => {
        throw Error("Not implemented");
    }


    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getAssetTypes = async (): Promise<string[]> => {
        throw Error("Not implemented");
    }


    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts = async (): Promise<BankAccountTypeExt[]> => {
        throw Error("Not implemented");
    }

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount = async (acc: BankAccountType[]): Promise<BankAccountTypeExt[]> => {
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
    updateBankAccount = async (id: number, data: Partial<BankAccountType>): Promise<BankAccountTypeExt> => {
        throw Error("Not implemented");
    }

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns The deleted account object data
     */
    deleteBankAccount = async (id: number): Promise<BankAccountTypeExt> => {
        throw Error("Not implemented");
    }

    /**
     * Delete all existing bank accounts
     */
    deleteAllAccounts = async (): Promise<void> => {
        throw Error("Not implemented");
    }
}

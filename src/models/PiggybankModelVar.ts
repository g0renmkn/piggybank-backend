import { type BankAccountType, type BankAccountTypeExt, type PiggybankModel } from "./ModelDefinitions";


const movementTypesTable = [
    "deposit",
    "withdrawal",
    "trade",
    "airdrop",
    "mining_reward",
    "fut_open_long",
    "fut_close_long",
    "fut_liq_long",
    "fut_open_short",
    "fut_close_short",
    "fut_liq_short"
];

const bankPeriodicitiesTable = [
    "one_time",
    "weekly",
    "biweekly",
    "monthly",
    "bimonthly",
    "quarterly",
    "yearly"
];

const assetTypesTable = [
    "fiat",
    "crypto",
    "stock",
    "fund"
];


/**
 * Piggybank Model class
 */
export class PiggybankModelVar implements PiggybankModel {
    bankAccounts: BankAccountTypeExt[];

    constructor() {
        this.bankAccounts = [];
    }


    /**
     * Get static table of Movement Types
     * 
     * @returns Array of possible values
     */
    getMovementTypes = (): string[] => {
        return movementTypesTable;
    }


    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities = (): string[] => {
        return bankPeriodicitiesTable;
    }


    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getAssetTypes = (): string[] => {
        return assetTypesTable;
    }


    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts = (): BankAccountTypeExt[] => {
        return this.bankAccounts;
    }

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount = (acc: BankAccountType): BankAccountTypeExt => {
        // ToDo
        return {
            "id": 0,
            "name": "dummy",
            "iban": "dummy",
            "closed": "",
            "comments": "dummy"
        }
    }

    /**
     * Update an existing bank account
     * 
     * @param id ID of the account to be updated
     * @param data Account data to be updated
     * 
     * @returns An updated account object
     */
    updateBankAccount = (id: number, data: BankAccountType): BankAccountTypeExt => {
        // ToDo
        return {
            "id": 0,
            "name": "dummy",
            "iban": "dummy",
            "closed": "",
            "comments": "dummy"
        }
    }

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns True if the account has been correctly deleted
     */
    deleteBankAccount = (id: number): boolean => {
        // ToDo
        return false;
    }
}

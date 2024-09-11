import { type BankAccountType, type BankAccountTypeExt, type PiggybankModel } from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


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
    bankAccountsCtr: number;
    bankAccounts: BankAccountTypeExt[];

    constructor(modelOpts?: object) {
        this.bankAccounts = [];
        this.bankAccountsCtr = 0;
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
    createBankAccount = (acc: BankAccountType[]): BankAccountTypeExt[] => {
        let retArray: BankAccountTypeExt[] = [];
        
        // Check if any of the input names already exist
        const inputNames: string[] = acc.map((ob) => {return ob.name});
        const duplicatedByName = this.bankAccounts.filter((ob) => {return inputNames.includes(ob.name)});
        const uniqueNames = new Set(inputNames);  // Check if the name is duplicated in the inputs
        if(duplicatedByName.length > 0 || inputNames.length !== uniqueNames.size) {
            throw(new PBDuplicateRecord());
        }

        // Check if any of the input IBANs already exist
        const inputNumbers: string[] = acc.map((ob) => {return ob.iban});
        const duplicatedByIBAN = this.bankAccounts.filter((ob) => {return inputNumbers.includes(ob.iban)});
        const uniqueNumbers = new Set(inputNumbers);  // Check if the IBAN is duplicated in the inputs
        if(duplicatedByIBAN.length > 0 || inputNumbers.length !== uniqueNumbers.size) {
            throw(new PBDuplicateRecord());
        }
        
        // No duplicates, add the new items
        acc.forEach(item => {
            this.bankAccountsCtr++;

            const retItem = {
                id: this.bankAccountsCtr,
                ... item
            }

            retArray.push(retItem);
            this.bankAccounts.push(retItem);
        })

        return retArray;
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
        const idx: number = this.bankAccounts.findIndex((itm) => itm.id === id);

        if(idx === -1) {
            throw(new PBNotFoundError(`The account number with ID=${id} does not exist.`));
        }
        else {
            const updatedBankAccount = {
                ... this.bankAccounts[idx],
                ... data
            }

            this.bankAccounts[idx] = updatedBankAccount;
        }

        return this.bankAccounts[idx];
    }

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns The deleted account object data
     */
    deleteBankAccount = (id: number): BankAccountTypeExt => {
        const idx: number = this.bankAccounts.findIndex((itm) => itm.id === id);

        if(idx === -1) {
            throw(new PBNotFoundError(`The account number with ID=${id} does not exist.`));
        }
        else {

        }

        const deletedAccount = this.bankAccounts[idx];
        this.bankAccounts.splice(idx, 1);

        return deletedAccount;
    }

    /**
     * Delete all existing bank accounts
     */
    deleteAllAccounts(): void {
        this.bankAccounts.length = 0;
    }
}

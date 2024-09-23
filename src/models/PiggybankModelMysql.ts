import mysql from "mysql2/promise";
import { type BankAccountType, type BankAccountTypeExt, type PiggybankModel } from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


interface StaticTableResult extends mysql.RowDataPacket{
    id: number,
    name: string
}


/**
 * Piggybank Model class
 */
export class PiggybankModelMysql implements PiggybankModel {
    opts: any;
    pool: mysql.Pool;

    constructor(modelOpts?: any) {
        if (!modelOpts || typeof modelOpts !== 'object') {
            throw("Model options are required");
        }
        if (!modelOpts.host) {
            throw("Model options must include a host");
        }
        if (!modelOpts.port) {
            throw("Model options must include a port");
        }
        if (!modelOpts.user) {
            throw("Model options must include a user");
        }
        if (!modelOpts.password) {
            throw("Model options must include a password");
        }
        if (!modelOpts.database) {
            throw("Model options must include a database");
        }

        this.opts = modelOpts;
        this.pool = mysql.createPool(this.opts);
    }

    /**
     * Initialize the data model
     * 
     * @returns Promise that resolves when initialization is complete
     */
    initModel = async (): Promise<void> => {
        // Nothing to do
    }


    /**
     * Get static table of Movement Types
     * 
     * @returns Array of possible values
     */
    getMovementTypes = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_mov_types ORDER BY id ASC";
        const [rows] = await this.pool.query<StaticTableResult[]>(q);

        return rows.map((row) => {return row.name});
    }


    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_bank_periodicities ORDER BY id ASC"
        const [rows] = await this.pool.query<StaticTableResult[]>(q);

        return rows.map((row) => {return row.name});
    }


    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    getAssetTypes = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_asset_types ORDER BY id ASC";
        const [rows] = await this.pool.query<StaticTableResult[]>(q);
        
        return rows.map((row) => {return row.name});
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

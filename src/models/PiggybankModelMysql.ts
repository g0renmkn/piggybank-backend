import mysql from "mysql2/promise";
import { 
    type PiggybankModel,
    type BankAccountType, 
    type BankAccountTypeExt,
    type BankCategoryType,
    type BankCategoryTypeExt
} from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


// iterfaces to extend the RowDataPacket for DB interactions
interface StaticTableResult extends mysql.RowDataPacket {
    id: number,
    name: string
}
interface DBBankAccountTypeExt extends mysql.RowDataPacket, BankAccountTypeExt {}
interface DBBankCategoryTypeExt extends mysql.RowDataPacket, BankCategoryTypeExt {}


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

    /** -------- Common Data ---------- */

    /**
     * Get common table of Movement Types
     * 
     * @returns Array of possible values
     */
    getCommonMovTypes = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_mov_types ORDER BY id ASC";
        const [rows] = await this.pool.query<StaticTableResult[]>(q);

        return rows.map((row) => {return row.name});
    }


    /**
     * Get common table of Asset Types
     * 
     * @returns Array of possible values
     */
    getCommonAssetTypes = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_asset_types ORDER BY id ASC";
        const [rows] = await this.pool.query<StaticTableResult[]>(q);
        
        return rows.map((row) => {return row.name});
    }

    /** -------- Banks Management ---------- */

    /**
     * Get table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
    getBankPeriodicities = async (): Promise<string[]> => {
        const q = "SELECT * FROM data_bank_periodicities ORDER BY id ASC"
        const [rows] = await this.pool.query<StaticTableResult[]>(q);

        return rows.map((row) => {return row.name});
    }


    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts = async (): Promise<BankAccountTypeExt[]> => {
        let ret: BankAccountTypeExt[] = [];

        const [rows] = await this.pool.query<DBBankAccountTypeExt[]>(
            "SELECT * FROM bank_accounts ORDER BY id ASC"
        );

        ret = rows.map((row) => {
            return {
                id: row.id,
                name: row.name,
                iban: row.iban,
                closed: row.closed,
                comments: row.comments,
                pfp: row.pfp
            };
        });

        return ret;
    }

    /**
     * Create a new account
     * 
     * @param acc Account object to be created
     * 
     * @returns An object with the newly created account data
     */
    createBankAccount = async (acc: BankAccountType[]): Promise<BankAccountTypeExt[]> => {
        let ret = [];

        const values = acc.map((item) => {
            return [item.name, item.iban, item.closed, item.comments, item.pfp];
        });

        try {
            const q = "INSERT INTO bank_accounts (name, iban, closed, comments, pfp) VALUES ?";
            const [insertResult] = await this.pool.query(q, [values]);
            
            const firstId = (insertResult as any).insertId;
            const lastId = firstId + (insertResult as any).affectedRows - 1;

            const [rows] = await this.pool.query<DBBankAccountTypeExt[]>(
                "SELECT * FROM bank_accounts WHERE id BETWEEN ? AND ?",
                [firstId, lastId]
            );

            ret = rows.map((row) => {
                return {
                    id: row.id,
                    name: row.name,
                    iban: row.iban,
                    closed: row.closed,
                    comments: row.comments,
                    pfp: row.pfp
                };
            });

        } catch (err) {
            if((err as any).code === 'ER_DUP_ENTRY') {
                throw new PBDuplicateRecord();
            }
            else {
                throw err;
            }
        }

        return ret;
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
        let fields = [];
        let values = [];

        if(data.name) {
            fields.push("name = ?");
            values.push(data.name);
        }
        if(data.iban) {
            fields.push("iban = ?");
            values.push(data.iban);
        }
        if(data.closed) {
            fields.push("closed = ?");
            values.push(data.closed);
        }
        if(data.comments) {
            fields.push("comments = ?");
            values.push(data.comments);
        }
        if(data.pfp) {
            fields.push("pfp = ?");
            values.push(data.pfp);
        }

        await this.pool.query(
            `UPDATE bank_accounts SET ${fields.join(', ')} WHERE id = ?`,
            values.concat([id.toString()])
        );

        const [rows] = await this.pool.query<DBBankAccountTypeExt[]>(
            "SELECT * FROM bank_accounts WHERE id = ?",
            [id]
        );

        if (rows.length===0) {
            throw new PBNotFoundError();
        }

        return rows[0];
    }

    /**
     * Delete an existing bank account
     * 
     * @param id ID of the account to be deleted
     * 
     * @returns The deleted account object data
     */
    deleteBankAccount = async (id: number): Promise<BankAccountTypeExt> => {
        // First try to get the account to be deleted
        const [rows] = await this.pool.query<DBBankAccountTypeExt[]>(
            "SELECT * FROM bank_accounts WHERE id = ?",
            [id]
        );

        // If not found, throw an error
        if (rows.length===0) {
            throw new PBNotFoundError();
        }

        // Otherwise, delete it
        await this.pool.query(
            "DELETE FROM bank_accounts WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    /**
     * Delete all existing bank accounts
     */
    deleteAllBankAccounts = async (): Promise<void> => {
        await this.pool.query("DELETE FROM bank_accounts");
    }

    /**
     * Get an array of available bank categories
     * 
     * @returns Array of category objects
     */
    getBankCategories = async (): Promise<BankCategoryTypeExt[]> => {
        let ret: BankCategoryTypeExt[] = [];

        const [rows] = await this.pool.query<DBBankCategoryTypeExt[]>(
            "SELECT * FROM bank_categories ORDER BY id ASC"
        );

        ret = rows.map((row) => {
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                icon: row.icon
            };
        });

        return ret;
    }

    /**
     * Create a new category
     * 
     * @param cat Category object to be created
     * 
     * @returns An object with the newly created category data
     */
    createBankCategory = async (cat: BankCategoryType[]): Promise<BankCategoryTypeExt[]> => {
        let ret = [];

        const values = cat.map((item) => {
            return [item.name, item.description, item.icon];
        });

        try {
            const q = "INSERT INTO bank_categories (name, description, icon) VALUES ?";
            const [insertResult] = await this.pool.query(q, [values]);
            
            const firstId = (insertResult as any).insertId;
            const lastId = firstId + (insertResult as any).affectedRows - 1;

            const [rows] = await this.pool.query<DBBankCategoryTypeExt[]>(
                "SELECT * FROM bank_categories WHERE id BETWEEN ? AND ?",
                [firstId, lastId]
            );

            ret = rows.map((row) => {
                return {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    icon: row.icon
                };
            });

        } catch (err) {
            if((err as any).code === 'ER_DUP_ENTRY') {
                throw new PBDuplicateRecord();
            }
            else {
                throw err;
            }
        }

        return ret;
    }

    /**
     * Update an existing bank category
     * 
     * @param id ID of the category to be updated
     * @param data Category data to be updated
     * 
     * @returns An updated category object
     */
    updateBankCategory = async (id: number, data: Partial<BankCategoryType>): Promise<BankCategoryTypeExt> => {
        let fields = [];
        let values = [];

        if(data.name) {
            fields.push("name = ?");
            values.push(data.name);
        }
        if(data.description) {
            fields.push("description = ?");
            values.push(data.description);
        }
        if(data.icon) {
            fields.push("icon = ?");
            values.push(data.icon);
        }

        await this.pool.query(
            `UPDATE bank_categories SET ${fields.join(', ')} WHERE id = ?`,
            values.concat([id.toString()])
        );

        const [rows] = await this.pool.query<DBBankCategoryTypeExt[]>(
            "SELECT * FROM bank_categories WHERE id = ?",
            [id]
        );

        if (rows.length===0) {
            throw new PBNotFoundError();
        }

        return rows[0];
    }

    /**
     * Delete an existing bank category
     * 
     * @param id ID of the category to be deleted
     * 
     * @returns Data of the deleted category
     */
    deleteBankCategory = async (id: number): Promise<BankCategoryTypeExt> => {
        // First try to get the category to be deleted
        const [rows] = await this.pool.query<DBBankCategoryTypeExt[]>(
            "SELECT * FROM bank_categories WHERE id = ?",
            [id]
        );

        // If not found, throw an error
        if (rows.length===0) {
            throw new PBNotFoundError();
        }

        // Otherwise, delete it
        await this.pool.query(
            "DELETE FROM bank_categories WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    /**
     * Delete all existing bank categories
     * 
     * @returns The deleted category objects
     */
    deleteAllBankCategories = async (): Promise<BankCategoryTypeExt[]> => {
        let ret: BankCategoryTypeExt[] = [];

        const [rows] = await this.pool.query<DBBankCategoryTypeExt[]>(
            "SELECT * FROM bank_categories ORDER BY id ASC"
        );

        ret = rows.map((row) => {
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                icon: row.icon
            };
        });

        await this.pool.query(
            "DELETE FROM bank_categories"
        );

        return ret;
    }

    /**
     * Clear all data from the data model
     */
    clearAllData = async (): Promise<void> => {
        await this.pool.query("SET foreign_key_checks = 0");
        await this.pool.query(`TRUNCATE TABLE bank_accounts`);
        await this.pool.query(`TRUNCATE TABLE bank_categories`);
        await this.pool.query("SET foreign_key_checks = 1");
    }
}

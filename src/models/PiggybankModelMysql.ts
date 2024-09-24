import mysql from "mysql2/promise";
import { type BankAccountType, type BankAccountTypeExt, type PiggybankModel } from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


interface StaticTableResult extends mysql.RowDataPacket {
    id: number,
    name: string
}

interface DBBankAccountTypeExt extends mysql.RowDataPacket {
    id: number,
    name: string,
    iban: string,
    closed: string,
    comments: string,
    pfp: string
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
        throw Error("Not implemented");
    }

    /**
     * Delete all existing bank accounts
     */
    deleteAllAccounts = async (): Promise<void> => {
        await this.pool.query("DELETE FROM bank_accounts");
    }
}

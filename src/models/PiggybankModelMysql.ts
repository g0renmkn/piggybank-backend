import mysql from "mysql2/promise";
import { 
    type PiggybankModel,
    type BankAccountTypeIn, 
    type BankAccountTypeOut,
    type BankCategoryTypeIn,
    type BankCategoryTypeOut,
    type BankMovementTypeIn,
    type BankMovementTypeOut
} from "./ModelDefinitions";
import { PBDuplicateRecord, PBNotFoundError } from "./PiggybankModelErrors";


// iterfaces to extend the RowDataPacket for DB interactions
interface StaticTableResult extends mysql.RowDataPacket {
    id: number,
    name: string
}
interface DBBankAccountType extends mysql.RowDataPacket, BankAccountTypeOut {}
interface DBBankCategoryType extends mysql.RowDataPacket, BankCategoryTypeOut {}
interface DBBankMovementType extends mysql.RowDataPacket, BankMovementTypeIn {}


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
        const q = "SELECT * FROM bank_periodicities ORDER BY id ASC"
        const [rows] = await this.pool.query<StaticTableResult[]>(q);

        return rows.map((row) => {return row.name});
    }


    /**
     * Get an array of available bank accounts
     * 
     * @returns Array of account objects
     */
    getBankAccounts = async (): Promise<BankAccountTypeOut[]> => {
        let ret: BankAccountTypeOut[] = [];

        const [rows] = await this.pool.query<DBBankAccountType[]>(
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
    createBankAccount = async (acc: BankAccountTypeIn[]): Promise<BankAccountTypeOut[]> => {
        let ret = [];

        const values = acc.map((item) => {
            return [item.name, item.iban, item.closed, item.comments, item.pfp];
        });

        try {
            const q = "INSERT INTO bank_accounts (name, iban, closed, comments, pfp) VALUES ?";
            const [insertResult] = await this.pool.query(q, [values]);
            
            const firstId = (insertResult as any).insertId;
            const lastId = firstId + (insertResult as any).affectedRows - 1;

            const [rows] = await this.pool.query<DBBankAccountType[]>(
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
    updateBankAccount = async (id: number, data: Partial<BankAccountTypeIn>): Promise<BankAccountTypeOut> => {
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

        const [rows] = await this.pool.query<DBBankAccountType[]>(
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
    deleteBankAccount = async (id: number): Promise<BankAccountTypeOut> => {
        // First try to get the account to be deleted
        const [rows] = await this.pool.query<DBBankAccountType[]>(
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
    getBankCategories = async (): Promise<BankCategoryTypeOut[]> => {
        let ret: BankCategoryTypeOut[] = [];

        const [rows] = await this.pool.query<DBBankCategoryType[]>(
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
    createBankCategory = async (cat: BankCategoryTypeIn[]): Promise<BankCategoryTypeOut[]> => {
        let ret = [];

        const values = cat.map((item) => {
            return [item.name, item.description, item.icon];
        });

        try {
            const q = "INSERT INTO bank_categories (name, description, icon) VALUES ?";
            const [insertResult] = await this.pool.query(q, [values]);
            
            const firstId = (insertResult as any).insertId;
            const lastId = firstId + (insertResult as any).affectedRows - 1;

            const [rows] = await this.pool.query<DBBankCategoryType[]>(
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
    updateBankCategory = async (id: number, data: Partial<BankCategoryTypeIn>): Promise<BankCategoryTypeOut> => {
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

        const [rows] = await this.pool.query<DBBankCategoryType[]>(
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
    deleteBankCategory = async (id: number): Promise<BankCategoryTypeOut> => {
        // First try to get the category to be deleted
        const [rows] = await this.pool.query<DBBankCategoryType[]>(
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
    deleteAllBankCategories = async (): Promise<BankCategoryTypeOut[]> => {
        let ret: BankCategoryTypeOut[] = [];

        const [rows] = await this.pool.query<DBBankCategoryType[]>(
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
     * Get an array of available bank movements
     * 
     * @returns An array of bank movements
     */
    getBankMovements = async (queryOpts: any = {}): Promise<BankMovementTypeOut[]> => {
        let ret: BankMovementTypeOut[] = [];
        let queryString = `
            SELECT 
                bank_movs.*,
                bank_accounts.name as acc_name, 
                bank_categories.name as cat_name,
                bank_periodicities.name as per_name
            FROM bank_movs 
            LEFT JOIN 
                bank_accounts ON bank_movs.acc_id = bank_accounts.id 
            LEFT JOIN 
                bank_categories ON bank_movs.category = bank_categories.id
            LEFT JOIN 
                bank_periodicities ON bank_movs.periodicity = bank_periodicities.id
            `;

        // Limit results
        if ("limit" in queryOpts && queryOpts.limit > 1) {
            queryString += ` LIMIT ${queryOpts.limit}`;

            // Offset query if requested
            // Page 1 is the first of all (not page 0)
            if (queryOpts.page ) {
                let offset: number = 0;

                if (queryOpts.page < 1) {
                    offset = 0;
                } else {
                    offset = (queryOpts.page - 1) * queryOpts.limit;
                }
                queryString += ` OFFSET ${offset}`;
            }
        }

        // Filter results
        if (["key", "dateFrom", "dateTo", "valueFrom", "valueTo", "idFrom", "idTo"].some((key) => key in queryOpts)) {
            queryString += " WHERE";
            let queryTokens = [];

            // Search params
            if ("key" in queryOpts) {
                let searchTokens = [];
                const searchFields = ["date", "description", "value", "notes"];
                
                searchTokens.push(...searchFields.map((field) => `bank_movs.${field} LIKE '%${queryOpts.key}%'`));
                searchTokens.push(`bank_movs.acc_id IN (SELECT id FROM bank_accounts WHERE name LIKE '%${queryOpts.key}%')`);
                searchTokens.push(`bank_movs.category IN (SELECT id FROM bank_categories WHERE name LIKE '%${queryOpts.key}%')`);
                searchTokens.push(`bank_movs.periodicity IN (SELECT id FROM bank_periodicities WHERE name LIKE '%${queryOpts.key}%')`);
                
                queryTokens.push(`(${searchTokens.join(" OR ")})`);
            }
            // Filter by date
            if ("dateFrom" in queryOpts) {
                queryTokens.push(`bank_movs.date >= DATE('${queryOpts.dateFrom}')`);
            }
            if ("dateTo" in queryOpts) {
                queryTokens.push(`bank_movs.date <= DATE('${queryOpts.dateTo}')`);
            }

            // Filter by value
            if ("valueFrom" in queryOpts) {
                queryTokens.push(`bank_movs.value >= ${queryOpts.valueFrom}`);
            }
            if ("valueTo" in queryOpts) {
                queryTokens.push(`bank_movs.value <= ${queryOpts.valueTo}`);
            }

            // Filter by ID
            if ("idFrom" in queryOpts) {
                queryTokens.push(`bank_movs.id >= ${queryOpts.idFrom}`);
            }
            if ("idTo" in queryOpts) {
                queryTokens.push(`bank_movs.id <= ${queryOpts.idTo}`);
            }

            queryString += ` ${queryTokens.join(" AND ")}`;
        }

        // Sort results
        if ("sortby" in queryOpts && ["id", "date", "acc_id", "category", "value", "periodicity"].includes(queryOpts.sortby)) {
            queryString += ` ORDER BY ${queryOpts.sortby}`;
        }
        else {
            queryString += " ORDER BY id";
        }

        // Sorting direction
        if ("order" in queryOpts && ["ASC", "DESC"].includes(queryOpts.order.toUpperCase())) {
            queryString += ` ${queryOpts.order}`;
        }
        else {
            queryString += " ASC";
        }

        const [result] = await this.pool.query<DBBankMovementType[]>(queryString);

        ret = result.map((row) => {
            return {
                id: row.id,
                acc_id: {
                    id: row.acc_id,
                    name: row.acc_name
                },
                date: row.date,
                category: {
                    id: row.category,
                    name: row.cat_name
                },
                description: row.description,
                value: row.value,
                periodicity: {
                    id: row.periodicity,
                    name: row.per_name
                },
                notes: row.notes
            };
        });

        return ret;
    }

    /**
     * Create a set of new bank movements
     * 
     * @param movs Array of movement objects to be created
     * @returns An array of created bank movements
     */
    createBankMovements = async (movs: BankMovementTypeIn[]): Promise<BankMovementTypeOut[]> => {
        throw new Error("Method not implemented.");
    }

    /**
     * Update an existing bank movement
     * 
     * @param id ID of the bank movement to be updated
     * @param mov New data for the bank movement
     * @returns An updated bank movement
     */
    updateBankMovement = async (id: number, mov: Partial<BankMovementTypeIn>): Promise<BankMovementTypeOut> => {
        throw new Error("Method not implemented.");
    }

    /**
     * Delete an existing bank movement
     * 
     * @param id ID of the bank movement to be deleted
     * @returns The deleted bank movement
     */
    deleteBankMovement = async (id: number): Promise<BankMovementTypeOut> => {
        throw new Error("Method not implemented.");
    }

    /**
     * Delete all bank movements
     * 
     * @returns Nothing
     */
    deleteAllBankMovements = async (): Promise<void> => {
        throw new Error("Method not implemented.");
    }

    /**
     * Clear all data from the data model
     */
    clearAllData = async (): Promise<void> => {
        await this.pool.query("SET foreign_key_checks = 0");
        await this.pool.query(`TRUNCATE TABLE bank_accounts`);
        await this.pool.query(`TRUNCATE TABLE bank_categories`);
        await this.pool.query(`TRUNCATE TABLE bank_movs`);
        await this.pool.query("SET foreign_key_checks = 1");
    }
}
